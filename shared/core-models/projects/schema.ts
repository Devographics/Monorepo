const schema = {
  _id: {
    type: String,
    canRead: ["guests"],
  },
  id: {
    type: String,
    canRead: ["guests"],
  },
  name: {
    type: String,
    canRead: ["guests"],
    searchable: true,
  },
  npm: {
    type: String,
    canRead: ["guests"],
    searchable: true,
  },
  github: {
    type: String,
    canRead: ["guests"],
    searchable: true,
  },
  description: {
    type: String,
    canRead: ["guests"],
    searchable: true,
  },
  homepage: {
    type: String,
    canRead: ["guests"],
    searchable: true,
  },
};

export default schema;
