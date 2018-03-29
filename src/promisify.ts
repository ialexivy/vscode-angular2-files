export const promisify = f => (...params) =>
  new Promise<any>((resolve, reject) => {
    f.apply(this, [...params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    }]);
  });
