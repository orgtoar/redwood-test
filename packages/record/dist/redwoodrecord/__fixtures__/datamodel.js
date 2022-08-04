"use strict";

module.exports = {
  enums: [],
  models: [{
    name: 'User',
    isEmbedded: false,
    dbName: null,
    fields: [{
      name: 'id',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      type: 'Int',
      hasDefaultValue: true,
      default: {
        name: 'autoincrement',
        args: []
      },
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'email',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: true,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'name',
      kind: 'scalar',
      isList: false,
      isRequired: false,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'posts',
      kind: 'object',
      isList: true,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'Post',
      hasDefaultValue: false,
      relationName: 'PostToUser',
      relationFromFields: [],
      relationToFields: [],
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'comments',
      kind: 'object',
      isList: true,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'Comment',
      hasDefaultValue: false,
      relationName: 'CommentToUser',
      relationFromFields: [],
      relationToFields: [],
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'hashedPassword',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'salt',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'resetToken',
      kind: 'scalar',
      isList: false,
      isRequired: false,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'resetTokenExpiresAt',
      kind: 'scalar',
      isList: false,
      isRequired: false,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'DateTime',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }],
    isGenerated: false,
    primaryKey: null,
    uniqueFields: [],
    uniqueIndexes: []
  }, {
    name: 'Post',
    isEmbedded: false,
    dbName: null,
    fields: [{
      name: 'id',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      type: 'Int',
      hasDefaultValue: true,
      default: {
        name: 'autoincrement',
        args: []
      },
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'userId',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: true,
      type: 'Int',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'user',
      kind: 'object',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'User',
      hasDefaultValue: false,
      relationName: 'PostToUser',
      relationFromFields: ['userId'],
      relationToFields: ['id'],
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'title',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'comments',
      kind: 'object',
      isList: true,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'Comment',
      hasDefaultValue: false,
      relationName: 'CommentToPost',
      relationFromFields: [],
      relationToFields: [],
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'categories',
      kind: 'object',
      isList: true,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'Category',
      hasDefaultValue: false,
      relationName: 'CategoryToPost',
      relationFromFields: [],
      relationToFields: ['id'],
      isGenerated: false,
      isUpdatedAt: false
    }],
    isGenerated: false,
    primaryKey: null,
    uniqueFields: [],
    uniqueIndexes: []
  }, {
    name: 'Category',
    isEmbedded: false,
    dbName: null,
    fields: [{
      name: 'id',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      type: 'Int',
      hasDefaultValue: true,
      default: {
        name: 'autoincrement',
        args: []
      },
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'name',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'posts',
      kind: 'object',
      isList: true,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'Post',
      hasDefaultValue: false,
      relationName: 'CategoryToPost',
      relationFromFields: [],
      relationToFields: ['id'],
      isGenerated: false,
      isUpdatedAt: false
    }],
    isGenerated: false,
    primaryKey: null,
    uniqueFields: [],
    uniqueIndexes: []
  }, {
    name: 'Comment',
    isEmbedded: false,
    dbName: null,
    fields: [{
      name: 'id',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      type: 'Int',
      hasDefaultValue: true,
      default: {
        name: 'autoincrement',
        args: []
      },
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'postId',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: true,
      type: 'Int',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'post',
      kind: 'object',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'Post',
      hasDefaultValue: false,
      relationName: 'CommentToPost',
      relationFromFields: ['postId'],
      relationToFields: ['id'],
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'userId',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: true,
      type: 'Int',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'user',
      kind: 'object',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'User',
      hasDefaultValue: false,
      relationName: 'CommentToUser',
      relationFromFields: ['userId'],
      relationToFields: ['id'],
      isGenerated: false,
      isUpdatedAt: false
    }, {
      name: 'body',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: false,
      isReadOnly: false,
      type: 'String',
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false
    }],
    isGenerated: false,
    primaryKey: null,
    uniqueFields: [],
    uniqueIndexes: []
  }]
};