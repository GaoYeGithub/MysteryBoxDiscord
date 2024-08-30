/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wn6gecgexveph5x")

  // remove
  collection.schema.removeField("p4o4b66g")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mn2g2pe5",
    "name": "rarity",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "p4o4b66g",
    "name": "rarity",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // remove
  collection.schema.removeField("mn2g2pe5")

  return dao.saveCollection(collection)
})
