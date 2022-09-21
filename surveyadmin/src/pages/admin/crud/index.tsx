import React from "react";
import models from "~/_vulcan/models.index";
import { PageLayout } from "~/core/components/layout";
import { Typography, List, ListItem } from "@mui/material";
import { Link } from "@vulcanjs/next-mui";

const ModelsPage = () => {
  return (
    <PageLayout>
      <Typography variant="h1">Your models</Typography>
      <List>
        {models.map((model) => (
          <ListItem key={model.name}>
            <Link href={"/admin/crud/" + model.name}>
              <Typography sx={{ textTransform: "capitalize" }}>
                {model.name}
              </Typography>
            </Link>
          </ListItem>
        ))}
      </List>
    </PageLayout>
  );
};

export default ModelsPage;
