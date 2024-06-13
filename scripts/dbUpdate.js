// Color codes
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";

const { config } = require("dotenv");
config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

console.log("\n\nStarting database update\n\n");

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

// Append username and password if available
if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
  mongoUri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}`;
}

// Connect to the MongoDB database
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

    // await DefinedReference.collection.createIndex(
    //   { title: 1 },
    //   { unique: true }
    // );

    // dynamically retrieve all the directories needed to insert in database and copy in static dir in references directory
    const dir = await fs.promises.readdir(path.join(
        __dirname,
        "..",
        "reference-models",
        "src",
        "references"
    ));

    // no need of the index.json in array
    const directories = dir.filter(e => e !== "index.json")

    // Process each directory
    const processDirectories = directories.map(async (directory) => {
      const directoryPath = path.join(
        __dirname,
        "..",
        "reference-models",
        "src",
        "references",
        directory
      );

      // Read files in the directory
      const files = await fs.promises.readdir(directoryPath);

      const processFiles = files.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        console.log(`Processing file ${filePath}`)
        try {
          // Read the JSON-LD file content
          const fileContent = await fs.promises.readFile(filePath, "utf8");

          // Parse the JSON-LD content
          const jsonld = JSON.parse(fileContent);

          // New refUrl and ptxOriginURL
          const RefURLSplit = jsonld["@id"]?.split("/");
          const fileName = RefURLSplit[RefURLSplit.length -1];
          const refURL =`${process.env.API_URL?.slice(0, -3)}/static/references/${directory}/${fileName}`;
          const ptxOriginURL = jsonld["@id"];
          jsonld["@id"] = refURL;

          const title = jsonld["title"]
            ? jsonld["title"]["@value"]
            : jsonld["name"]["@value"]
            ? jsonld["name"]["@value"]
            : jsonld["name"]
            ? jsonld["name"]
            : "";

          const uid = fileName.slice(0,-5);

          try {
            // Update or insert the document and create static file
              await fs.promises.mkdir(path.join(__dirname, `../static/${directory}`), {recursive: true})
                  .then(async x => {
                    // if file doesn't exist we wait all the promise (writefile and insert)
                    if(!fs.existsSync(path.join(__dirname, `../static/${directory}/${fileName}`))){
                      await Promise.all([
                          fs.promises.writeFile(path.join(__dirname, `../static/${directory}/${fileName}`), JSON.stringify(jsonld, null, 2)),
                      DefinedReference.findOneAndUpdate(
                          {title, type: directory, uid},
                          {type: directory, refURL, ptxOriginURL , jsonld: JSON.stringify(jsonld), uid},
                          {upsert: true}
                      )])
                    }
                    // if file already exists, update db and write file
                    else {
                      await Promise.all([
                        fs.promises.writeFile(path.join(__dirname, `../static/${directory}/${fileName}`), JSON.stringify(jsonld, null, 2)),
                        DefinedReference.findOneAndUpdate(
                            {title},
                            {
                              type: directory,
                              refURL: refURL,
                              ptxOriginURL ,
                              jsonld: JSON.stringify(jsonld),
                              uid
                            },
                            {upsert: true}
                        )])
                    }
                  });
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
          }
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      });

      // Wait for all file processing to complete
      await Promise.all(processFiles);
    });

    // Wait for all directory processing to complete
    Promise.all(processDirectories)
      .then(() => {
        console.log(`${GREEN} Database update complete ${RESET}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
