import React, { useState } from "react";
import { FormCheck } from "react-bootstrap";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
// import { isOtherValue, removeOtherMarker, addOtherMarker } from './Checkboxgroup';
import {
  FormInputProps,
  useFormContext,
  useVulcanComponents,
} from "@vulcanjs/react-ui";
import { useEntities } from "~/core/components/common/EntitiesContext";
import { FormControl } from "react-bootstrap";
import get from "lodash/get.js";
import IconComment from "~/core/components/icons/Comment";
import IconCommentDots from "~/core/components/icons/CommentDots";
import { useIntlContext } from "@vulcanjs/react-i18n";

interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

export const Experience = (props: ExperienceProps) => {
  const {
    refFunction,
    path,
    inputProperties,
    itemProperties = {},
    document,
    showDescription,
  } = props;
  const Components = useVulcanComponents();
  const { questionId } = itemProperties;

  const commentPath = path.replace("__experience", "__comment");
  const commentValue = get(document, commentPath);

  const [showCommentInput, setShowCommentInput] = useState(!!commentValue);

  const { data, loading, error } = useEntities();
  const { entities } = data;
  const entity = entities?.find((e) => e.id === questionId);

  // @ts-expect-error
  const { options = [], value, ...otherInputProperties } = inputProperties;
  const hasValue = value !== "";

  return (
    <Components.FormItem
      path={/*inputProperties.*/ path}
      label={inputProperties.label}
      showDescription={showDescription}
      {...itemProperties}
    >
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options.map((option, i) => {
            const isChecked = value === option.value;
            const checkClass = hasValue
              ? isChecked
                ? "form-check-checked"
                : "form-check-unchecked"
              : "";
            return (
              // @ts-expect-error
              <FormCheck
                {...otherInputProperties}
                key={i}
                layout="elementOnly"
                type="radio"
                // @ts-ignore
                label={<Components.FormOptionLabel option={option} />}
                value={option.value}
                name={path}
                id={`${path}.${i}`}
                path={`${path}.${i}`}
                ref={refFunction}
                checked={isChecked}
                className={checkClass}
              />
            );
          })}
        </div>

        <CommentTrigger
          value={commentValue}
          showCommentInput={showCommentInput}
          setShowCommentInput={setShowCommentInput}
        />
      </div>
      {showCommentInput && (
        <CommentInput
          path={commentPath}
          value={commentValue}
          questionLabel={inputProperties.label}
          questionEntity={entity}
          questionValue={value}
          questionOptions={options}
          questionPath={path}
        />
      )}
    </Components.FormItem>
  );
};

const CodeExample = ({ language, code, codeHighlighted }) => {
  const Components = useVulcanComponents();
  return (
    <div className="code-example">
      <h5 className="code-example-heading">
        <FormattedMessage id="general.code_example" />
      </h5>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: codeHighlighted }}></code>
      </pre>
    </div>
  );
};

const CommentTrigger = ({ value, showCommentInput, setShowCommentInput }) => {
  const isActive = showCommentInput || !!value;
  const intl = useIntlContext();

  return (
    <div className="comment-trigger-wrapper">
      <button
        className={`comment-trigger comment-trigger-${
          isActive ? "active" : "inactive"
        }`}
        type="button"
        aria-describedby="popover-basic"
        aria-label={intl.formatMessage({ id: "experience.leave_comment" })}
        onClick={() => {
          setShowCommentInput(!showCommentInput);
        }}
      >
        {value ? <IconCommentDots /> : <IconComment />}
        <span className="visually-hidden">
          <FormattedMessage id="experience.leave_comment" />
        </span>
      </button>
    </div>
  );
};

const CommentInput = ({
  path,
  value,
  questionLabel,
  questionValue,
  questionOptions,
  questionEntity,
  questionPath,
}) => {
  const { getDocument, updateCurrentValues } = useFormContext();
  const Components = useVulcanComponents();

  // if label has been translated, use that to override entity name
  const label =
    (questionLabel.toLowerCase() !== questionPath && questionLabel) ||
    questionEntity?.name;
  const response = questionOptions?.find(
    (o) => o.value === questionValue
  )?.label;

  return (
    <div className="comment-input">
      <h5 className="comment-input-heading">
        <FormattedMessage
          id="experience.leave_comment"
          values={{ label }}
          html={true}
        />
      </h5>
      <p className="comment-input-subheading">
        {questionValue ? (
          <FormattedMessage
            id="experience.tell_us_more"
            values={{ response }}
            html={true}
          />
        ) : (
          <FormattedMessage id="experience.tell_us_more_no_value" />
        )}
      </p>
      <FormControl
        as="textarea"
        onChange={(event) => {
          let value = event.target.value;
          if (value === "") {
            updateCurrentValues({ [path]: null });
          } else {
            updateCurrentValues({ [path]: value });
          }
        }}
        value={value}
        // ref={refFunction}
        // {...inputProperties}
      />
    </div>
  );
};

export default Experience;
