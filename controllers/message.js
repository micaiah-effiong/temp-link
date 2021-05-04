const db = require("../models");
const asyncHandler = require("../handlers/async-handler");

const getMsg = async (req, res) => {
  // find message
  const msg = await db.Message.findOne({
    where: {
      hash: req.params.msgHash,
    },
  });

  // check if message is available
  if (!msg) {
    return res.notFound().json({
      success: false,
      errorType: "Not Found",
      msg: "Resource not found",
    });
  }

  // check if message has expired
  if (msg.expired()) {
    await db.Message.destroy({ where: { hash: msg.hash } });
    return res.ok().json({
      success: true,
      msg: "Message expired",
    });
  }

  if (msg.isSecure) {
    const data = {
      isSecured: true,
      messageHash: msg.hash,
      authorizationUrl: `${req.headers.host}/message/${msg.hash}/verify`,
    };

    return res.ok().json({
      success: true,
      data: data,
    });
  }

  const msgData = msg.toPublicJSON();
  msgData.count -= 1;

  res.ok().json({
    success: true,
    data: msgData,
  });

  if (msg.count - 1 === 0) {
    return await db.Message.destroy({ where: { hash: msg.hash } });
  }

  await msg.decrement("count");
};

const verify = async (req, res) => {
  const msg = await db.Message.findOne({
    where: {
      hash: req.params.msgHash,
    },
  });

  if (!msg) {
    return res.badRequest().json({
      success: false,
      errorType: "Bad Request",
    });
  }

  if (!(await msg.verify(req.body.passcode))) {
    return res.badRequest().json({
      success: true,
      errorType: "Bad Request",
      msg: "Invalid password",
    });
  }

  res.ok().json({
    success: true,
    data: msg.toPublicJSON(),
  });

  if (msg.count - 1 === 0) {
    return await db.Message.destroy({ where: { hash: msg.hash } });
  }

  await msg.decrement("count");
  return;
};

const create = async (req, res) => {
  if (process.env.NODE_ENV !== "production") {
    req.body.url = `http://localhost.com:${3000}/message/`;
  } else {
    req.body.url = `${process.env.APP_URL}/message/`;
  }

  Object.entries(req.body).forEach((prop) => {
    const key = prop[0];
    const value = prop[1];
    if (value === "") {
      delete req.body[key];
    }
  });

  const msg = await db.Message.create(req.body).catch((err) => {
    console.log("err_name", err.name, err);
    if (err.name.toLowerCase().includes("validation")) {
      res.badRequest();
    }
    throw err;
  });
  return res.created().json({ success: true, data: msg.toPublicJSON() });
};

exports.getMsg = asyncHandler(getMsg);
exports.verify = asyncHandler(verify);
exports.create = asyncHandler(create);
