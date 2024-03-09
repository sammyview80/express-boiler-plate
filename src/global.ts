interface String {
  toDate: () => Date;
  toTitleCase: () => string;
}

String.prototype.toDate = function (): Date {
  return new Date(this.toString());
};

String.prototype.toTitleCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
