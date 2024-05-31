# Prometheus-X Catalog Registry

The Prometheus-X Catalog Registry is a REST API service designed to handle updates of reference models from the Prometheus-X Reference Models GitHub repository and synchronize them with a database. In addition, it provides support for catalog instance-defined reference models, including roles, value sharing, business models, building blocks, requirements, and more.

## Prometheus-X Service Ecosystem

The Catalog Registry is one of the components allowing management of the catalog. Even though it is independant and serves its own purpose, users of a catalog will need interaction with more than one service. Thus, if you want to run a full catalog, consider looking into deploying the [Catalog API](https://github.com/Prometheus-X-association/catalog-api) and the [Ecosystem Matcher](https://github.com/Prometheus-X-association/ecosystem-matcher).

In addition, the Prometheus-X Full specifications can be found on the [Prometheus-X docs repo/wiki](https://github.com/Prometheus-X-association/docs/wiki/Prometheus%E2%80%90X-Building-Blocks:-Enabling-Secure-Data-Ecosystems-and-Consent%E2%80%90driven-Data-Sharing)

## Features

The Prometheus-X Catalog Registry offers the following features:

1. **Reference Model Updates**: The service automates the process of updating reference models from the Prometheus-X Reference Models GitHub repository. It ensures that the latest versions are synchronized with the database, providing up-to-date information to catalog participants and administrators.

2. **Catalog Instance-defined Reference Models**: In addition to the core reference models, the registry allows catalog participants to define their own reference models. This feature enables customization and flexibility within the data ecosystem, accommodating specific roles, value sharing mechanisms, business models, building blocks, requirements, and other related entities.

3. **REST API**: The Prometheus-X Catalog Registry is built as a RESTful API, making it easy to integrate and interact with other services or applications. Catalog participants and data ecosystem administrators can utilize the API to retrieve and create information for the registry.

## Installation
### Locally

To install and run the Prometheus-X Catalog Registry without docker, follow these steps:

1. Clone the repository from GitHub: `git clone https://github.com/prometheus-x/catalog-registry.git`
2. Navigate to the project directory: `cd catalog-registry`
3. Install the required dependencies: `npm install`
4. Configure the application by setting up the necessary environment variables. You will need to specify database connection details and other relevant settings.
5. Initialize your database by running `npm run db:init`
6. Build the App `npm run build`
7. Start the application: `npm run start`
8. The Prometheus-X Catalog Registry will be accessible at the specified URL.

### Docker
1. Clone the repository from GitHub: `git clone https://github.com/prometheus-x/catalog-registry.git`
2. Navigate to the project directory: `cd catalog-registry`
3. Configure the application by setting up the necessary environment variables. You will need to specify database connection details and other relevant settings.
4. Create a docker network using `docker network create ptx`
5. Start the application: `docker-compose up -d`
6. If you need to rebuild the image `docker-compose build` and restart with: `docker-compose up -d` 
7. If you don't want to use the mongodb container from the docker compose you can use the command `docker run -d -p your-port:your-port --name catalog-registry catalog-registry` after running `docker-compose build`

## API Documentation

For detailed information on how to use the Prometheus-X Catalog Registry API, refer to the API documentation. The documentation provides comprehensive details on the available endpoints, request/response formats and examples.

You can access the API documentation from your instance at `http://your-registry-url/docs` after starting the application.

You can also access the [github pages](https://prometheus-x-association.github.io/catalog-registry/) of this repository that services an example swagger for easy access without installing the project.

## Contributing

Contributions to the Prometheus-X Catalog Registry are welcome! If you would like to contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make the necessary code changes, adhering to the project's coding style and guidelines.
4. Write appropriate tests to ensure code integrity.
5. Commit your changes and push the branch to your forked repository.
6. Submit a pull request to the main repository, describing your changes in detail.

Please ensure that your contributions align with the project's coding standards, have proper test coverage, and include necessary documentation or updates to existing documentation.

## License

The Prometheus-X Catalog Registry is released under the [MIT License](LICENSE). You are free to use, modify, and distribute the software as per the terms specified in the license.

## Support

If you encounter any issues or have questions regarding the Prometheus-X Catalog Registry, feel free to open an issue on the GitHub repository. The project maintainers and community members will be happy to assist you.
