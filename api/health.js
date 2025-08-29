const handler = (_req, res) => {
  return res
    .status(200)
    .json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: 'mongodb'
    });
};

export default handler;