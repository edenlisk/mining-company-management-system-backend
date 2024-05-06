# 📗 Table of Contents

- [📖 About the Project](#about-project)
    - [🛠 Built With](#built-with)
        - [Tech Stack](#tech-stack)
        - [Key Features](#key-features)
    - [🚀 Live Demo](#live-demo)
- [💻 Getting Started](#getting-started)
    - [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Usage](#usage)
    - [Run tests](#run-tests)
    - [Deployment](#triangular_flag_on_post-deployment)
- [👥 Authors](#authors)
- [🔭 Future Features](#future-features)
- [🤝 Contributing](#contributing)
- [⭐️ Show your support](#support)
- [🙏 Acknowledgements](#acknowledgements)
- [📝 License](#license)


# 📖 [Mineral Traceability & Inventory Management Software backend] <a name="about-project"></a>


**[Mineral Traceability * Inventory Management Software]** This software was designed to meet the needs for ICGLR local mineral processors. It has a number of features from recording new mineral entries from miners to making shipment to international buyers. It has great user-friendly interface for smooth navigation. 
## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary>Client</summary>
  <ul>
    <li><a href="https://nodejs.org/en">Nodejs</a></li>
    <li><a href="https://expressjs.com/">Expressjs</a></li>
    <li><a href="https://mongoosejs.com/">Mongoose</a></li>
    <li><a href="https://www.syncfusion.com/">Syncfusion</a></li>
    <li><a href="https://www.mongodb.com/">MongoDB</a></li>
    <li><a href="https://jestjs.io/">Jest (Testing)</a></li>
  </ul>
</details>


### Key Features <a name="key-features"></a>

- **Protected with user authentication**
- **Uses Google Authenticator to generate one time login OTP**
- **Records mineral entries**
- **Records suppliers**
- **Records Mine Tags**
- **Records Negociant Tags**
- **Generates lab report (MS DOCUMENT)**
- **Generates tag list, negociant tag list**
- **Generates invoices**
- **Tracks the changes in stock balances for managed different minerals**
- **Provides general settings for the app**
- **Allow access based on permissions for the user**
- **Track user's activities for transparency**


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🚀 Live Demo <a name="live-demo"></a>
Click [here](https://mining-database.vercel.app/) to view a live demo of the project.
Click [here](https://github.com/ijosue16/mining-database) to get to the frontend repository.
demo email: demouser@gmail.com    
demo password: moonlover35


<p align="right">(<a href="#readme-top">back to top</a>)</p>


## 💻 Getting Started <a name="getting-started"></a>


To get a local copy up and running, follow these steps.

### Prerequisites

In order to run this project you need:

You need to have git installed and the desired code editor

### Setup

Clone this repository to your desired folder:

```sh
  cd my-folder
  git clone https://github.com/edenlisk/mining-company-management-system-backend.git
```

### Install

Install this project with:

```sh
  cd my-folder
  npm install
```
### Usage

Before running the project, make sure you add .env file with the following variables
```shell
NODE_ENV = 
PORT = 
MONGO_URL = 
JWT_SECRET_KEY = 
MONGO_URI_TEST=
EXPIRES_IN = 
JWT_COOKIE_EXPIRES_IN = 
EMAIL_PUBLIC_KEY = 
EMAIL_PRIVATE_KEY = 
EMAIL_SERVICE_ID = 
PASSWORD_RESET_EMAIL_TEMPLATE_ID = 
EMAIL_FROM = 
IMAGEKIT_ID = 
IMAGEKIT_PRIVATE_KEY = 
IMAGEKIT_PUBLIC_KEY = 
TOTP_SECRET = 
```
To run the project in development mode, execute the following command:


```sh
  npm start:dev
```


### Deployment

You can run the project in production mode using:


```sh
    npm start:prod
```

### Run tests

You can run tests by using the following command:

```shell
    npm run test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 👥 Authors <a name="authors"></a>

👤 **Edenlisk**

- GitHub: [@Edenlisk](https://github.com/edenlisk)
- Twitter: [@Edenlisk](https://twitter.com/nkumbuyedeni)

  👤 **Josue**

- GitHub: [@Josue16](https://github.com/ijosue16)
- Twitter: [@Josue16](https://twitter.com/iradukunda_23)


<p align="right">(<a href="#readme-top">back to top</a>)</p>


## 🔭 Future Features <a name="future-features"></a>

[comment]: <> (> Describe 1 - 3 features you will add to the project.)

- **Add suppliers section (Dashboard)**
- **Add Accounting functionalities**

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/ijosue16/library-management-system-front-end/issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## ⭐️ Show your support <a name="support"></a>

[comment]: <> (> Write a message to encourage readers to support your project)

If you like this project kindly consider giving ⭐

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🙏 Acknowledgments <a name="acknowledgements"></a>

[comment]: <> (> Give credit to everyone who inspired your codebase.)

We would like to thank [Venant Nsanzimfura]() who guided us throughout development process.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📝 License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
