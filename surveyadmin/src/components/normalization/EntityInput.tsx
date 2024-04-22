import { Entity } from "@devographics/types";
import { useState } from "react";
import newGithubIssueUrl from "new-github-issue-url";
import FieldValue from "./FieldValue";

export const getAddEntityUrl = (id: string, questionId?: string) =>
  newGithubIssueUrl({
    user: "devographics",
    repo: "entities",
    title: `Add Entity: ${id}`,
    labels: ["add entity"],
    body: `
~~~
- id: ${id}
  tags:
    - ${questionId || "*example_tag*"}
  patterns:
    - *matching pattern*
~~~
`,
  });

export const getEditEntityUrl = (id: string, patterns: string[] = []) =>
  newGithubIssueUrl({
    user: "devographics",
    repo: "entities",
    title: `Edit Entity: ${id}`,
    labels: ["edit entity"],
    body: `
~~~            
- id: ${id}
  patterns:
${patterns.map((pattern) => `    - ${pattern}`).join("\n")}
    - *new pattern here*
~~~`,
  });

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
      <p>{/* <FieldValue value={value} /> */}</p>
      <p>
        <label htmlFor="entities">Pick Entity</label>
      </p>
      <EntityList
        entities={entities}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
      {selectedId ? (
        entity ? (
          <EntityItem entity={entity} />
        ) : (
          <div>
            <p>No matching entity found…</p>
            <p>
              <a
                rel="noopener noreferrer"
                href={getAddEntityUrl(selectedId)}
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

export const EntityList = ({
  entities,
  selectedId,
  setSelectedId,
  setShowCreateNew,
}) => {
  return (
    <>
      <input
        className="entities-list"
        list="entities-list"
        id="entities"
        name="entities"
        value={selectedId}
        onFocus={(e) => {
          setShowCreateNew(true);
        }}
        onBlur={(e) => {
          setShowCreateNew(false);
        }}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedId(value);
        }}
      />
    </>
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
          rel="noopener noreferrer"
          href={getEditEntityUrl(id, patterns)}
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
