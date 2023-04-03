## When to use a mutator
Mutators are the best way to manipulate a Vulcan document for creation/update/deletion.
Contrary to a direct database update, mutators are able to check permissions and run 
callbacks tied to a model.

## Move mutators to "@vulcanjs/crud"

Mutators are not really dependent on GraphQL and may be moved in the "crud" package in the future.

The only limitation currently is that we store the "connector" into the "vulcan.graphql" object instead of "vulcan.crud".

## Steps

Mutators have following steps:

1. Authorization
First we check if the document exists and if the user requesting the mutation has the authorization to do so.

2. Validation
If the mutator call is not trusted (for example, it comes from a GraphQL mutation),
we'll run all validate steps:

- Check that the current user has permission to insert/edit each field.
- Add userId to document (insert only).
- Run validation callbacks.

3. Before Callbacks

The third step is to run the mutation argument through all the [before] callbacks.

4. Operation

We then perform the insert/update/remove operation.

5. After Callbacks

We then run the mutation argument through all the [after] callbacks.

6. Async Callbacks

Finally, *after* the operation is performed, we execute any async callbacks.
Being async, they won't hold up the mutation and slow down its response time
to the client.
