"use client";
import { useState } from "react";
import ModalTrigger from "../ui/ModalTrigger";
import { renameTokens } from "~/lib/normalization/services";

export const RenameTokens = (props) => {
  return (
    <ModalTrigger
      isButton={false}
      label="🔁 Rename Tokens"
      tooltip="Rename custom tokens"
      header={<div>Rename Custom Tokens</div>}
    >
      <Rename {...props} />
    </ModalTrigger>
  );
};

const Rename = (props) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>();
  return (
    <section>
      <p>
        Note: this will only affect custom & AI tokens. To rename regular
        tokens, relaunch normalization on entire dataset.{" "}
      </p>
      <hr />
      <label>
        Current Token:{" "}
        <input
          type="text"
          disabled={loading}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
          }}
        />
      </label>
      <label>
        New Token:{" "}
        <input
          type="text"
          disabled={loading}
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
          }}
        />
      </label>
      <button
        aria-busy={loading}
        onClick={async (e) => {
          setLoading(true);
          e.preventDefault();
          const tokens = [{ from, to }];
          const results = await renameTokens({
            tokens,
          });
          console.log(results);
          setResult(results);
          setLoading(false);
        }}
      >
        Rename
      </button>
      {result && (
        <p>
          <hr />
          Found {result?.data?.modifiedCount} entries to rename.
        </p>
      )}
    </section>
  );
};
