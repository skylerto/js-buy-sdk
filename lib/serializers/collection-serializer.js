function CollectionSerializer() {
}

Object.defineProperties(CollectionSerializer.prototype, {
  serializeSingle: {
    configurable: true,
    enumerable: false,
    value: function (singlePayload, shopClient) {
      const models = singlePayload.collection_publications;
      const model = this.modelFromAttrs(models[0], shopClient);

      return model;
    }
  },

  serializeCollection: {
    configurable: true,
    enumerable: false,
    value: function (collectionPayload, shopClient) {
      const models = collectionPayload.collection_publications;

      return models.map(attrs => {
        const model = this.modelFromAttrs(attrs, shopClient);

        return model;
      });
    }
  },

  modelFromAttrs: {
    configurable: true,
    enumerable: false,
    value: function (attrs, shopClient) {
      return Object.create(Object.prototype, {
        serializer: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: this
        },
        shopClient: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: shopClient
        },
        attrs: {
          configurable: true,
          writable: true,
          enumerable: true,
          value: attrs
        }
      });
    }
  }
});

export default CollectionSerializer;