const { config } = require("dotenv");
config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const instanceConfig = require("../instance.config.json");

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";

// Check if all required environment variables are set
const requiredEnvVars = ["MONGO_HOST", "MONGO_DATABASE", "API_URL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `${RED} Missing environment variables: ${missingEnvVars.join(
      ", "
    )} ${RESET}`
  );
  process.exit(1);
}

// Construct the MongoDB URI
let mongoUri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
console.log(mongoUri);

// Append username and password if available
if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
  mongoUri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`;
}

const getContext = () => {
  return {
    "@context": {
      xsd: "http://www.w3.org/2001/XMLSchema#",
      definition: {
        "@id": "https://schema.org/DefinedTerm",
        "@container": "@language",
      },
    },
  };
};

const getId = (category, uid) => {
  return `${process.env.API_URL}/static/references/${category}/${uid}.json`;
};

const getName = (name) => {
  return {
    name: {
      "@type": "xsd:string",
      "@value": name,
    },
  };
};

const getDefinition = (names) => {
  return {
    definition: names.map((name, lang) => {
      return {
        "@language": lang,
        "@value": name,
      };
    }),
  };
};

const getDescription = (descriptions) => {
  return {
    description: descriptions.map((description, lang) => {
      return {
        "@language": lang,
        "@value": description,
      };
    }),
  };
};

const getUid = (title) => {
  return title.toLowerCase().replace(/ /g, "-");
};

const clearStaticFiles = async (categories) => {
  for (const category of categories) {
    const staticDir = path.join(__dirname, `../static/${category}`);
    if (fs.existsSync(staticDir)) {
      await fs.promises.rm(staticDir, { recursive: true, force: true });
      console.log(`${GREEN} Cleared static files for ${category} ${RESET}`);
    }
  }
};

const clearDatabaseEntries = async (categories) => {
  const DefinedReference = mongoose.model("DefinedReference");
  for (const category of categories) {
    await DefinedReference.deleteMany({ type: category });
    console.log(`${GREEN} Cleared database entries for ${category} ${RESET}`);
  }
};

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log(`${GREEN} Connected to MongoDB ${RESET}`);

    const schema = new mongoose.Schema({
      type: { type: String, required: true },
      refURL: { type: String, required: false },
      ptxOriginURL: { type: String, required: false },
      title: { type: String, required: true },
      jsonld: { type: String, required: true },
      uid: { type: String, required: false },
    });

    const DefinedReference = mongoose.model("DefinedReference", schema);

    const insertData = async (category, data) => {
      const uid = getUid(data.title);
      const refURL = `${process.env.API_URL}/static/references/${category}/${uid}.json`;
      const jsonld = JSON.stringify({
        ...getContext(),
        "@id": refURL,
        ...getName(data.title),
        ...getDefinition(data.description ? [data.description] : []),
        ...getDescription(data.description ? [data.description] : []),
      });
      
      const ptxOriginURL = refURL;

      await DefinedReference.findOneAndUpdate(
        { title: data.title, type: category },
        {
          type: category,
          title: data.title,
          jsonld,
          uid,
          refURL,
          ptxOriginURL,
        },
        { upsert: true }
      );

      const staticDir = path.join(__dirname, `../static/${category}`);
      await fs.promises.mkdir(staticDir, { recursive: true });
      await fs.promises.writeFile(path.join(staticDir, `${uid}.json`), jsonld);
    };

    const processInstanceConfig = async () => {
      const categories = Object.keys(instanceConfig);
      await clearStaticFiles(categories);
      await clearDatabaseEntries(categories);

      for (const category of categories) {
        for (const data of instanceConfig[category]) {
          await insertData(category, data);
        }
      }
    };

    processInstanceConfig()
      .then(() => {
        console.log(`${GREEN} Instance configuration processed ${RESET}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error(
          `${RED} Error processing instance configuration: ${error} ${RESET}`
        );
        process.exit(1);
      });
  })
  .catch((error) => {
    console.error(`${RED} Error connecting to MongoDB: ${error} ${RESET}`);
    process.exit(1);
  });
