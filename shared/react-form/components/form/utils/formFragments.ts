/**
 * Generate mutation and query fragments for a form based on the schema
 * TODO: refactor to mutualize more code with vulcan-core defaultFragment functions
 * TODO: move to lib when refactored
 */
import _uniq from "lodash/uniq.js";
import _intersection from "lodash/intersection.js";
import gql from "graphql-tag";
import {
  getCreateableFields,
  getUpdateableFields,
  getFragmentFieldNames,
  //isBlackbox,
} from "@vulcanjs/schema";
import {
  getFieldFragment,
  VulcanGraphqlModel,
  //isBlackbox,
} from "@vulcanjs/graphql";
import { capitalize } from "@vulcanjs/utils";
import type { FormType } from "../typings";
import compact from "lodash/compact.js";
//  getFieldFragment,
const intlSuffix = "_intl";

// PostsEditFormQueryFragment/PostsNewFormMutationFragment/etc.
const getFragmentName = (
  formType: FormType,
  multiTypeName: string,
  fragmentType: "mutation" | "query"
) =>
  [multiTypeName, formType, "form", fragmentType, "fragment"]
    .map(capitalize)
    .join("");

// get modifiable fields in the query either for update or create operations
const getQueryFieldNames = ({ schema, options }) => {
  const queryFields =
    options.formType === "new"
      ? getCreateableFields(schema)
      : getUpdateableFields(schema);
  return queryFields;
};
// add readable fields to mutation fields
const getMutationFieldNames = ({ readableFieldNames, queryFieldNames }) => {
  return _uniq(queryFieldNames.concat(readableFieldNames));
};

/*
const getFieldFragment = ({ schema, fieldName, options }) => {
    let fieldFragment = fieldName;
    const field = schema[fieldName];
    if (!(field && field.type)) return fieldName;
    const fieldType = field.type.singleType;
    const fieldTypeName =
        typeof fieldType === 'object'
            ? 'Object'
            : typeof fieldType === 'function'
                ? fieldType.name
                : fieldType;

    if (fieldName.slice(-5) === intlSuffix) {
        fieldFragment = `${fieldName}{ locale value }`;
    } else {
        switch (fieldTypeName) {
            // recursive call for nested arrays and objects
            case 'Object':
                if (!isBlackbox(field) && fieldType._schema) {
                    fieldFragment =
                        getSchemaFragment({
                            fragmentName: fieldName,
                            schema: fieldType._schema,
                            options,
                        }) || null;
                }
                break;
            case 'Array':
                const arrayItemFieldName = `${fieldName}.$`;
                const arrayItemField = schema[arrayItemFieldName];
                // note: make sure field has an associated array item field
                if (arrayItemField) {
                    // child will either be native value or a an object (first case)
                    const arrayItemFieldType = arrayItemField.type.singleType;
                    if (!arrayItemField.blackbox && arrayItemFieldType._schema) {
                        fieldFragment =
                            getSchemaFragment({
                                fragmentName: fieldName,
                                schema: arrayItemFieldType._schema,
                                options,
                            }) || null;
                    }
                }
                break;
            default:
                // handle intl or return fieldName
                fieldFragment = fieldName;
                break;
        }
    }
    return fieldFragment;
};
*/

// get fragment for a whole schema (root schema or nested schema of an object or an array)
const getSchemaFragment = ({
  schema,
  fragmentName,
  options,
  fieldNames: providedFieldNames,
}) => {
  // differentiate mutation/query and create/update cases
  // respect provided fieldNames if any (needed for the root schema)
  const fieldNames =
    providedFieldNames ||
    (options.isMutation
      ? getMutationFieldNames({
        queryFieldNames: getQueryFieldNames({ schema, options }),
        readableFieldNames: getFragmentFieldNames({
          schema,
          options: { onlyViewable: true },
        }),
      })
      : getQueryFieldNames({ schema, options }));

  const childFragments =
    fieldNames.length &&
    fieldNames
      .map((fieldName) =>
        getFieldFragment({
          schema,
          fieldName,
          options,
          getObjectFragment: getSchemaFragment, // allow to reuse the code from defaultFragment with another behaviour
        })
      )
      // remove empty values
      .filter((f) => !!f);
  if (childFragments.length) {
    return `${fragmentName} { ${childFragments.join("\n")} }`;
  }
  return null;
};

/**
 * Generate query and mutation fragments for forms, dynamically  based on the selected fields
 */
export const getFormFragments = ({
  formType = "new",
  model,
  fields, // restrict on certain fields
  addFields, // add additional fields (eg to display static fields)
}: {
  model: VulcanGraphqlModel;
  formType: FormType;
  fields?: Array<string>; // restrict on certain fields
  addFields?: Array<string>; // add additional fields (eg to display static fields)
}) => {
  const { schema, name, graphql } = model;
  const { typeName, multiTypeName } = graphql;
  // get the root schema fieldNames
  let queryFieldNames = getQueryFieldNames({ schema, options: { formType } });
  let mutationFieldNames = getMutationFieldNames({
    queryFieldNames,
    readableFieldNames: getFragmentFieldNames({
      schema,
      options: { onlyViewable: true },
    }),
  });

  // if "fields" prop is specified, restrict list of fields to it
  if (fields && fields?.length > 0) {
    // add "_intl" suffix to all fields in case some of them are intl fields
    const fieldsWithIntlSuffix = fields.map((field) => `${field}${intlSuffix}`);
    const allFields = [...fields, ...fieldsWithIntlSuffix];
    queryFieldNames = _intersection(queryFieldNames, allFields);
    mutationFieldNames = _intersection(mutationFieldNames, allFields);
  }

  // add "addFields" prop contents to list of fields
  if (addFields?.length) {
    queryFieldNames = queryFieldNames.concat(addFields);
    mutationFieldNames = mutationFieldNames.concat(addFields);
  }

  // userId is used to check for permissions, so add it to fragments if possible
  if (schema.userId) {
    queryFieldNames.unshift("userId");
    mutationFieldNames.unshift("userId");
  }

  if (schema._id) {
    queryFieldNames.unshift("_id");
    mutationFieldNames.unshift("_id");
  }

  // check unicity (_id can be added twice)
  queryFieldNames = _uniq(queryFieldNames);
  mutationFieldNames = _uniq(mutationFieldNames);

  if (queryFieldNames.length === 0)
    // NOTE: in theory, you could have no queriable fields, but mutable fields =>
    // a form for data that you can create but can never see...
    // Since that doesn't make much sense, we throw an error to secure the end user
    throw new Error(
      `Model "${model.name}" has no queryable fields, cannot create a form for it. Please add readable/createable/updateable fields to the model schema.`
    );
  if (mutationFieldNames.length === 0)
    throw new Error(
      `Model "${model.name}" has no mutable fields, cannot create a form for it. Please add createable/updateable fields to model schema.`
    );

  const queryFragmentName = getFragmentName(
    formType,
    multiTypeName, // previously collectionName //name,
    "query"
  );
  // generate query fragment based on the fields that can be edited. Note: always add _id, and userId if possible.
  // TODO: support nesting
  const queryFragmentText = getSchemaFragment({
    schema,
    fragmentName: `fragment ${queryFragmentName} on ${typeName}`,
    options: { formType, isMutation: false },
    fieldNames: queryFieldNames,
  });
  if (!queryFragmentText) {
    // NOTE: this should never happen if we don't have an empty array for field names
    throw new Error(
      `Model ${model.name} with fields ${queryFieldNames} yield an empty query fragment.`
    );
  }
  const generatedQueryFragment = gql(queryFragmentText);

  const mutationFragmentName = getFragmentName(
    formType,
    multiTypeName, // previously collectionName,
    "mutation"
  );
  const mutationFragmentText = getSchemaFragment({
    schema,
    fragmentName: `fragment ${mutationFragmentName} on ${typeName}`,
    options: { formType, isMutation: true },
    fieldNames: mutationFieldNames,
  });
  if (!mutationFragmentText) {
    // NOTE: this should never happen if we don't have an empty array for field names
    throw new Error(
      `Model ${model.name} with fields ${mutationFieldNames} yield an empty mutation fragment.`
    );
  }
  // generate mutation fragment based on the fields that can be edited and/or viewed. Note: always add _id, and userId if possible.
  // TODO: support nesting
  const generatedMutationFragment = gql(mutationFragmentText);

  // if any field specifies extra queries, add them
  const extraQueries = compact(
    getQueryFieldNames({ schema, options: { formType } }).map((fieldName) => {
      const field = schema[fieldName];
      return field.query;
    })
  );
  // get query & mutation fragments from props or else default to same as generatedFragment
  return {
    queryFragment: generatedQueryFragment,
    mutationFragment: generatedMutationFragment,
    queryFragmentName,
    mutationFragmentName,
    extraQueries,
  };
};