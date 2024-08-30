/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wn6gecgexveph5x")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "61r322cr",
    "name": "answer",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wn6gecgexveph5x")

  // remove
  collection.schema.removeField("61r322cr")

  return dao.saveCollection(collection)
})
