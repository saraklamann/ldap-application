should = require('chai').should()
crypto = require 'crypto'
fs = require 'fs'
Yml = require '../build/main'

describe 'Yml', ->
  
  path       = __dirname+'/config.yml'
  path_noenv = __dirname+'/config-noenv.yml'
  path_nodef = __dirname+'/config-nodef.yml'
  key        = __dirname+'/security.key.pem'
  cert       = __dirname+'/security.pub'

  it "should load config and deep merge defaults with env", ->
    configs = Yml.load path, { key: key }
    configs.should.be.an 'object'
    configs.username.should.be.equal 'admin'
    configs.devices.should.be.eql { android: true, windows: true, ios: true }
    configs.password.should.be.equal 'password'
    configs.days.should.be.instanceof Array

  it "should load config based on env", ->
    configs = Yml.load path, 'production'
    configs.password.should.be.equal 'secret'

  it "should salt strings", ->
    phrase = 'password'
    salt = Yml.encrypt phrase, cert
    private_key = fs.readFileSync key
    buffer = new Buffer salt, 'base64'
    decrypted = crypto.privateDecrypt private_key, buffer
    decrypted = decrypted.toString 'utf8'
    decrypted.should.be.equal phrase

  it "should load config with no env", ->
    configs = Yml.load path_noenv
    configs.should.not.be.empty

  it "should load config with no default with correct env", ->
    configs = Yml.load path_nodef, 'production'
    configs.password.should.be.equal 'secret'
