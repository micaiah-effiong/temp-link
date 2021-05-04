const _ = require("underscore");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

module.exports = function (sequelize, DataType) {
  const model = sequelize.define(
    "Message",
    {
      data: {
        type: DataType.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Message cannot be empty",
          },
        },
      },
      ttl: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
        validate: {
          notEmpty: true,
          isAfter: {
            args: new Date().toLocaleDateString("en-ca"),
            msg: "Detruction date must be a future date",
          },
        },
      },
      count: {
        type: DataType.NUMBER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          notEmpty: true,
        },
      },
      passcode: {
        type: DataType.VIRTUAL,
      },
      url: {
        type: DataType.STRING,
        allowNull: false,
        validate: {
          isUrl: {
            msg: "The URL is not a valid HTTP URL",
          },
        },
      },
      hash: {
        type: DataType.STRING,
        unique: true,
        primaryKey: true,
      },
      salt: {
        type: DataType.STRING,
        unique: true,
      },
      isSecure: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      passcodeHash: {
        type: DataType.STRING,
      },
      passcodeSalt: {
        type: DataType.STRING,
      },
    },
    {
      hooks: {
        beforeValidate: async function (model, option) {
          // console.log(model, model.__proto__);
        },
        beforeCreate: async function (model) {
          if (model.passcode) {
            model.setDataValue("isSecure", true);
            const passcodeSalt = await bcrypt.genSalt();
            const passcodeHash = await bcrypt.hash(
              model.passcode,
              passcodeSalt
            );
            model.setDataValue("passcodeHash", passcodeHash);
            model.setDataValue("passcodeSalt", passcodeSalt);
          }

          const rounds = model.data.split(" ")[0].length * 5;
          const salt = (await bcrypt.genSalt(rounds)) + Date.now();

          const hash = crypto
            .createHmac("sha256", salt)
            .update(model.data)
            .digest("hex");

          model.setDataValue("salt", salt);
          model.setDataValue("hash", hash);
          model.setDataValue("url", model.url + hash);
        },
      },
    }
  );

  model.prototype.toPublicJSON = function (...data) {
    return _.omit(
      this.toJSON(),
      "passcode",
      "passcodeHash",
      "salt",
      "passcodeSalt",
      ...data
    );
  };

  model.prototype.verify = async function (passcode) {
    const isValid = Boolean(await bcrypt.compare(passcode, this.passcodeHash));
    return isValid;
  };

  model.prototype.expired = function () {
    const now = new Date().getTime();
    const ttl = new Date(this.ttl).getTime();
    return now > ttl;
  };

  return model;
};
