import { Entity } from "@devographics/types";
import { useState } from "react";
import newGithubIssueUrl from "new-github-issue-url";
import FieldValue from "./FieldValue";

const EntityInput = ({
  value,
  entities,
}: {
  value: string[] | string;
  entities: Entity[];
}) => {
  const [selectedId, setSelectedId] = useState("");
  if (!entities || entities.length === 0) {
    return <p>No entities loaded. </p>;
  }

  const entity = entities.find((e) => e.id === selectedId);

  return (
    <div className="entityinput">
      <p>
        <FieldValue value={value} />
      </p>
      <p>
        <label htmlFor="entities">Pick Entity</label>
      </p>
      <input
        list="entities-list"
        id="entities"
        name="entities"
        value={selectedId}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedId(value);
        }}
      />
      <datalist id="entities-list">
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}></option>
        ))}
      </datalist>
      {selectedId ? (
        entity ? (
          <EntityItem entity={entity} />
        ) : (
          <div>
            <p>No matching entity found…</p>
            <p>
              <a
                href={newGithubIssueUrl({
                  user: "devographics",
                  repo: "entities",
                  title: `Add Entity: ${selectedId}`,
                  labels: ["add entity"],
                  body: `
~~~
- id: ${selectedId}
  tags:
    - foo
  patterns:
    - bar
~~~
`,
                })}
                role="button"
                target="_blank"
              >
                Suggest New Entity
              </a>
            </p>
          </div>
        )
      ) : null}
    </div>
  );
};

const EntityItem = ({ entity }: { entity: Entity }) => {
  const { id, patterns = [], tags = [] } = entity;
  return (
    <div>
      <h3>{id}</h3>
      <h5>Tags</h5>
      <ul>
        {tags?.map((tag) => (
          <li key={tag}>
            <code>{tag}</code>
          </li>
        ))}
      </ul>
      <h5>Patterns</h5>

      {patterns.length > 0 ? (
        <ul>
          {patterns?.map((pattern) => (
            <li key={pattern}>
              <code>{pattern}</code>
            </li>
          ))}
        </ul>
      ) : (
        <p>No patterns defined. </p>
      )}
      <p>
        <a
          href={newGithubIssueUrl({
            user: "devographics",
            repo: "entities",
            title: `Edit Entity: ${id}`,
            labels: ["edit entity"],
            body: `
~~~            
- id: ${id}
  tags:
    - foo
  patterns:
${patterns.map((pattern) => `    - ${pattern}`).join("\n")}
~~~`,
          })}
          role="button"
          target="_blank"
        >
          Suggest Edit
        </a>
      </p>
    </div>
  );
};
export default EntityInput;
