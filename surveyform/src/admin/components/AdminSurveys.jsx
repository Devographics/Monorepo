import React from 'react';
import { Components } from 'meteor/vulcan:core';
import surveys from '../../surveys';

const AdminSurveys = () => (
  <div className="admin-surveys admin-content">
    <Components.Datatable
      data={surveys}
      columns={['name', 'slug', 'year', 'status', 'imageUrl']}
    />
  </div>
);


export default AdminSurveys;
