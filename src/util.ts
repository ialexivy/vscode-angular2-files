export const promisify = (f) => {
  return (...params) => {
    return new Promise<any>((resolve, reject) => {
      f.apply(this, [...params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }]);
    });
  };
};
