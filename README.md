# LDAP Application

## Overview

This project is an application that interacts with an LDAP server, facilitating the management of users and groups. The system allows operations like adding or removing users from groups and querying user information directly in the LDAP. Additionally, it reads data from XML files and uses XPath to automate operations on the LDAP server.

## Technologies Used

- **Node.js**: Platform to run the backend of the application.
- **TypeScript**: Used for development with static typing, ensuring more safety and clarity in the code.
- **LDAP**: The protocol used for communication and manipulation of data in the LDAP server.
- **XPath**: Used to read and manipulate data in XML files.
- **ExecSync**: Used to execute LDAP commands directly from the code.
- **Bash**: Used to run LDAP commands in the terminal.

## Key Features

- **User and Group Management**: Add and remove users from groups, as well as query user information.
- **XML File Reading**: Read XML files to automate data insertion and modification operations in LDAP.
- **Automation with XPath**: Uses XPath to map and retrieve specific data within XML files.
- **Executing LDAP Commands**: Direct execution of LDAP commands to create, modify, and query entries in the server.

## Installation

To run the project, you will need to have Node.js and LDAP configured on your environment. Follow the steps below to install and set up the project.

1. **Clone the Repository**

```bash
git clone https://github.com/saraklamann/ldap-application.git
cd ldap-application

npm install

## LDAP Configuration

To set up the LDAP directory and initialize users and groups, you need to run init.ldif.
