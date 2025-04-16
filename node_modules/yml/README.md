yml
======

[![Build Status](https://travis-ci.org/tectual/yml.svg)](https://travis-ci.org/tectual/yml)
[![npm version](https://badge.fury.io/js/yml.svg)](http://badge.fury.io/js/yml)
[![Coverage Status](https://coveralls.io/repos/tectual/yml/badge.svg?branch=master)](https://coveralls.io/r/tectual/yml?branch=master)


## Load a yaml file in Node.js

It can load a yaml file based on NODE_ENV or passed env (or using development as default). It uses [ursa](https://www.npmjs.com/package/ursa) for encryption. 

It can deep merge `default` section and `env` section of your yaml perfectly.

You can have yaml file
```yaml
default: 
  username: Admin
  password: Password
  days:
    - Monday
    - Tuesday
    - Friday
  devices:
    android: true
    ios: false
development:
  password: local
  devices:
    ios: true
production:
  password: decrypt(A7YzqIBjGgXWKA9yl81hgSal7djwBuXK5nBS15JswtzyxKWXilS8buiTZ2XqK9czq)
```

```coffee
configs = Yml.load 'config.yml'
# { username: 'Admin', password: 'local', days: ['Monday', 'Tuesday', 'Friday'], devices: { android: true, ios: true } }
configs = Yml.load 'config.yml', 'production', { key: 'security.key.pem' }
# { username: 'Admin', password: 'decrypted_pass', days: ['Monday', 'Tuesday', 'Friday'], devices: { android: true, ios: false } }
```

If you have defined **NODE_ENV** in your system, you dont need to pass the env parameter.
```coffee
# if NODE_ENV = 'production' is set in server, these lines have same result
configs = Yml.load 'config.yml', { key: 'security.key.pem' }
configs = Yml.load 'config.yml', 'production', { key: 'security.key.pem' }
# { username: 'Admin', password: 'decrypted_pass', days: ['Monday', 'Tuesday', 'Friday'], devices: { android: true, ios: false } }
```

## Encryption

You should create public/private keys with a command like this:

```bash
openssl rsa -in security.key.pem -pubout -out security.pub 
```
You can store public key in the machine which responsible for generating the encrypted information. And use private key in the machine which should load the `.yml` file.


You can use the helper method provided in the library to generate the encrypted phrase, instead of storing the password or critical information.

```coffee
Yml = require 'yml'
Yml.encrypt 'password', 'security.pub'
# A7YzqIBjGgXWKA9yl81hgSal7djwBuXK5nBS15JswtzyxKWXilS8buiTZ2XqK9czq
# You can store this value in your .yml file
```
You can read more about encryption [here](https://www.npmjs.com/package/ursa).
