# 🚀 @xolvio/instant-mock

Your ultimate GraphQL Federation-native mocking solution for accelerated development! 🎭✨

## 🌟 Supercharge Your GraphQL Development

Effortlessly spin up a fully-featured, schema-aware GraphQL mock server that:

* 🔗 Seamlessly integrates with Apollo Studio
* 🏢 Supports enterprise HTTP proxies
* 🗄️ Provides flexible database options

With @xolvio/instant-mock, creating consistent, team-specific mock data for GraphQL APIs is easier than ever! 🎉

## 🔥 Key Features

* 🌠 **Apollo Studio Integration:** Directly syncs with Apollo Studio, including schema and variant management.
* 📜 **Flexible Schema Management:** Import schemas from files or Apollo Studio for on-demand introspection.
* 🔒 **Enterprise HTTP Proxy Support:** Works seamlessly within enterprise network environments.
* 🛡️ **Secure Data Management:** Leverages encryption keys for securely storing sensitive data.
* 🗃️ **Database Agnostic:** Ships with SQLite by default, but also supports PostgreSQL and MySQL.

## 🚀 Quick Start (on default port 3033)

Experience the simplicity:

```bash
npm start
```
```bash
docker compose up
```

That's it! Head on over to `http://localhost:3033` to start mocking like a pro! 😎

## 🎭 How It Works

### 🖥️ Main Interface

The @xolvio/instant-mock experience is divided into three main tabs:

1. 🔍 **Query:** Select and explore schemas, inspect schema variants, and instantly mock responses.
2. 💾 **Data:** Create and manage seed data, including Seed Groups for isolated team-specific mocks.
3. 🤝 **Collaborate:** Use Narrative's Annotator, enabling schema-to-UI annotations and collaborative mockup validation.

### 🚀 Feature Breakdown

#### 🔍 Query Tab

Instantly introspect and explore any graph from your schema. Choose a schema and variant, and let instant-mock provide you with auto-generated responses for every field using Faker.js, with sensible defaults.

🔮 **Coming Soon:** Customize Faker.js configurations for more control over default mock data.

#### 💾 Data Tab

Here's where @xolvio/instant-mock shines ✨. After executing an operation in the Query tab, you can create seed data by clicking "Create Seed From Response". This takes you to the Data tab, where you can modify and persist your responses.

* 🌱 **Seed Manager:** Manage and modify seed data for consistent responses.
* 👥 **Seed Groups:** Separate mock responses by group, allowing multiple teams to work with isolated, idempotent mock data for the same operations.

#### 🤝 Collaborate Tab

Enhance cross-functional collaboration with real data-backed annotations and schema management:

* 🖊️ **Narrative Integration:** Sign up for Narrative to use the Annotator, powered by instant-mock, for UI mockup annotations directly from your schema.
* 🔄 **Schema Proposal Automation:** Detect mismatches between your mock operations and schema, and automatically generate a schema proposal for Apollo Studio—instantly backed by a mock server.

## 🙌 Powered by Open Source

@xolvio/instant-mock is proudly powered by gq-mock, with extensive contributions to the MockServer functionality. A special thanks to the gq-mock team for laying the groundwork that enables instant-mock to excel! 🎉

## 🏆 Why Choose @xolvio/instant-mock?

Say goodbye to:

* 👋 Unreliable Postman collections
* 👋 Ad-hoc mock servers
* 👋 Mismatched schemas

By centralizing mock data with Apollo Federation awareness, @xolvio/instant-mock delivers consistent, reliable mock data that scales with your team's needs. Whether you're a frontend engineer, backend developer, or QA, instant-mock is designed to make your life easier and boost your productivity! 🚀💪

## 📚 Documentation

For detailed documentation, check out our [Wiki](comingsoon).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](comingsoon) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](comingsoon) file for details.

## 🙏 Acknowledgments

* The amazing [gq-mock](https://github.com/wayfair-incubator/gqmock) team
* Our fantastic community of users and contributors

Made with ❤️ by the @xolvio team
