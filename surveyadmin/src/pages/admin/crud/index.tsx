import React from "react";
import models from "~/_vulcan/models.index";
import { PageLayout } from "~/core/components/layout";
import Link from "next/link";

const ModelsPage = () => {
  return (
    <PageLayout>
      <h1>Your models</h1>
      <ul>
        {models.map((model) => (
          <li key={model.name}>
            <Link href={"/admin/crud/" + model.name} passHref>
              <p style={{ textTransform: "capitalize" }}>{model.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
};

export default ModelsPage;
