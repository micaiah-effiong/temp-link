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
      ttl: {
        type: DataType.DATE,
        defaultValue: new Date().setFullYear(3000),
      },
      count: {
        type: DataType.NUMBER,
        defaultValue: 1,
      },
      isSecure: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      passcode: {
        type: DataType.VIRTUAL,
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
        beforeValidate: async function (model, option) {},
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
        },
      },
    }
  );

  model.prototype.toPublicJSON = function () {
    return _.omit(
      this.toJSON(),
      "passcode",
      "passcodeHash",
      "salt",
      "passcodeSalt"
    );
  };

  model.prototype.verify = async function (passcode) {
    const isValid = Boolean(await bcrypt.compare(passcode, this.passcodeHash));
    console.log("isValid", isValid);
    return isValid;
  };

  model.prototype.expired = function () {
    const now = new Date().getTime();
    const ttl = new Date(this.ttl).getTime();
    return now > ttl;
  };

  return model;
};
