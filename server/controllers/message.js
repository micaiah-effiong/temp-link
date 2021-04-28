exports.getMsg = async (req, res) => {
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

exports.verify = async (req, res) => {
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

exports.create = async (req, res) => {
  req.body.url = `${req.protocol}://${req.headers.host}/message/`;
  const msg = await db.Message.create(req.body);
  return res.created().json({ success: true, data: msg.toPublicJSON() });
};
