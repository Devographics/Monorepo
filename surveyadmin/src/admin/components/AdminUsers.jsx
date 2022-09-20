import React from 'react';
import { Components } from 'meteor/vulcan:core';
import Users from 'meteor/vulcan:users';

const AdminUsers = () => (
  <div className="admin-users admin-content">
    <Components.Datatable
      collection={Users}
      columns={[
        {
          name: 'createdAt',
          sortable: true,
        },
        // TODO: legacy field from Meteor
        {
          name: 'displayName',
          sortable: true,
        },
        /*
        TODO: now we have only emailHash
        {
          name: 'email',
          sortable: true,
        },*/
        {
          name: 'groups',
          filterable: true,
        },
      ]}
    />
  </div>
);

export default AdminUsers;
