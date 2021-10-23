const errorConverter = (error, req, res, next) =>{
  console.log("error Converter", JSON.stringify(error));
  if (error) {
    return res
      .status(error.statusCode)
      .json({ errorMessage: error.errorMessage, errorCode: error.errorCode });
  }
  return res.status(500);
}

export { errorConverter };
