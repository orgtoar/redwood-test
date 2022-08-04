"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperationName = getOperationName;

/**
 * Given a query like the one below this function will return
 * `FindBlogPostQuery`
 *
 * ```
 *   export const QUERY = gql`
 *     query FindBlogPostQuery($id: Int!) {
 *       blogPost: post(id: $id) {
 *         id
 *         title
 *         body
 *         createdAt
 *       }
 *     }
 *   `
 * ```
 *
 * @param {DocumentNode} document
 *   graphql query or mutation to get the operation name for
 * @returns {string} empty string if no operation name could be found
 */
function getOperationName(document) {
  for (const definition of document.definitions) {
    var _definition$name;

    if (definition.kind === 'OperationDefinition' && (_definition$name = definition.name) !== null && _definition$name !== void 0 && _definition$name.value) {
      return definition.name.value;
    }
  }

  return '';
}