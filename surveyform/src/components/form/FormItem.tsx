/*

Layout for a single form item

*/
"use client";
import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  forwardRef,
  RefObject,
} from "react";

import { useIntlContext } from "@devographics/react-i18n";
import Form from "react-bootstrap/Form";
import { FormInputProps } from "./typings";
import { CommentTrigger, CommentInput } from "./FormComment";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getQuestioni18nIds } from "~/i18n/survey";
import { useQuestionTitle } from "~/lib/surveys/helpers/useQuestionTitle";
import { getFormPaths } from "@devographics/templates";
import AddToList from "~/components/reading_list/AddToList";
import QuestionLabel from "./QuestionLabel";
import { Button } from "../ui/Button";
import { Skip } from "../icons";
import { Unskip } from "../icons/Unskip";

import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useFormStateContext } from "./FormStateContext";
import { useFormPropsContext } from "./FormPropsContext";
import { SectionMetadata } from "@devographics/types";
import { DbPathsEnum } from "@devographics/types";

export interface FormItemProps extends FormInputProps {
  children: ReactNode;
  showMore?: boolean;
  showOther?: boolean;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  className?: string;
  isInvalid?: boolean;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  function FormItem(props: FormItemProps, parentRef) {
    // TODO: using response here makes the component rerender for nothing
    // TODO: depending on stateStuff forces component to rerender systematically
    const { stateStuff, response } = useFormStateContext();
    const { section, edition, readOnly } = useFormPropsContext();
    const {
      children,
      path,
      question,
      showMore,
      showOther,
      questionNumber,
      onBlur,
      className = "",
      updateCurrentValues,
      isInvalid,
    } = props;

    const isLastItem = questionNumber === section.questions.length;

    const {
      itemPositions,
      setItemPositions,
      reactToChanges,
      setReactToChanges,
    } = stateStuff;

    const { allowComment } = question;

    const formPaths = getFormPaths({ edition, question });
    const commentPath = formPaths.comment;
    const commentValue = commentPath && response?.[commentPath];

    const skipPath = formPaths[DbPathsEnum.SKIP]!;
    const isSkipped = response?.[skipPath];
    const skippedClass = isSkipped ? "form-item-skipped" : "";

    const enableSkip = skipPath && edition.enableSkip && !question.isRequired;

    // open the comment widget if there is already a comment or this is the first question
    const [showCommentInput, setShowCommentInput] = useState(
      (!readOnly && question.showCommentInput) || !!commentValue
    );

    const childRef = useRef<HTMLDivElement>(null);
    const myRef = (parentRef as RefObject<HTMLDivElement>) || childRef;
    const firstRenderRef1 = useRef(true);
    const firstRenderRef2 = useRef(true);

    const getItemPosition = () => {
      const top = myRef?.current?.getBoundingClientRect()?.top || 0;
      const scrollTop = document.documentElement.scrollTop;
      return top + scrollTop;
    };

    const updateItemPositions = () => {
      // console.log("// calculating itemPositions");
      setItemPositions((itemPositions) => ({
        ...itemPositions,
        [question.id]: getItemPosition(),
      }));
    };

    // only run once
    useEffect(() => {
      updateItemPositions();
    }, []);

    // run whenever something that could affect component height changes
    // but not on first render
    useEffect(() => {
      if (firstRenderRef1.current) {
        firstRenderRef1.current = false;
        return;
      }
      setReactToChanges(true);
    }, [showCommentInput, showMore, showOther]);

    // run whenever reactToChange changes, but not on first render
    useEffect(() => {
      if (firstRenderRef2.current) {
        firstRenderRef2.current = false;
        return;
      }
      if (myRef?.current && reactToChanges) {
        updateItemPositions();
        if (isLastItem) {
          setReactToChanges(false);
        }
      }
    }, [reactToChanges]);

    // /*

    // Track when an item comes into view

    // */
    // const [isInView, setIsInView] = useState(false);
    // const firstRenderRef3 = useRef(true);

    // const handleScroll = () => {
    //   const position = window.scrollY;
    //   const itemId = getItemIdInViewport(position, itemPositions);
    //   const isInView = itemId === question.id;
    //   setIsInView(isInView);
    // };

    // // run on scroll
    // useEffect(() => {
    //   window.addEventListener("scroll", handleScroll, { passive: true });
    //   return () => {
    //     window.removeEventListener("scroll", handleScroll);
    //   };
    // }, []);

    // // run whenever an item comes into view for the first time
    // // but not on first render
    // useEffect(() => {
    //   if (firstRenderRef3.current) {
    //     firstRenderRef3.current = false;
    //     return;
    //   }
    //   if (isInView) {
    //     // TODO: updateCurrentValues with timestamp of item first coming into view
    //     // TODO: updateCurrentValues with timestamp every time question value is modified
    //   }
    // }, [isInView]);

    const isInvalidClass = isInvalid ? "form-item-invalid" : "";

    return (
      <div
        className={`form-item ${className} ${skippedClass} ${isInvalidClass}`}
        ref={myRef}
        onBlur={onBlur}
      >
        <Form.Group as="fieldset" controlId={path}>
          <FormItemTitle {...props} section={section} />
          <div className="form-item-contents">
            <div className="form-item-contents-inner">
              <FormItemDescription {...props} />
              <FormItemLimit {...props} />
              <div className="form-item-input">{children}</div>
              <FormItemNote {...props} />

              {allowComment && (
                <CommentTrigger
                  value={commentValue}
                  showCommentInput={showCommentInput}
                  setShowCommentInput={setShowCommentInput}
                />
              )}
              {allowComment && showCommentInput && commentPath && (
                <CommentInput
                  {...props}
                  commentPath={commentPath}
                  commentValue={commentValue}
                />
              )}
            </div>
          </div>
        </Form.Group>
        {enableSkip && (
          <SkipButton
            skipPath={skipPath}
            isSkipped={isSkipped}
            updateCurrentValues={updateCurrentValues}
          />
        )}
      </div>
    );
  }
);

export const SkipButton = ({
  isSkipped,
  skipPath,
  updateCurrentValues,
}: {
  isSkipped: boolean;
  skipPath: string;
  updateCurrentValues: any;
}) => {
  const toggleSkipped = () => {
    updateCurrentValues({ [skipPath]: !isSkipped });
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="general.skip_question.description">
          <FormattedMessage
            id={
              isSkipped
                ? "general.unskip_question.description"
                : "general.skip_question.description"
            }
          />
        </Tooltip>
      }
    >
      <div className="skip-question">
        <Button
          size="sm"
          onClick={(e) => {
            toggleSkipped();
          }}
        >
          <FormattedMessage
            id={isSkipped ? "general.unskip_question" : "general.skip_question"}
          />
          {isSkipped ? <Unskip /> : <Skip />}
        </Button>
      </div>
    </OverlayTrigger>
  );
};

export const FormItemTitle = (
  props: FormItemProps & { section: SectionMetadata }
) => {
  const { question, enableReadingList, section } = props;
  const intl = useIntlContext();
  const { yearAdded } = question;

  const { clean: label } = useQuestionTitle({ section, question });

  return (
    <legend className="form-label-legend">
      <h3 className="form-label-heading" id={question.id}>
        <Form.Label>
          <QuestionLabel section={section} question={question} />

          {yearAdded === 2023 && (
            <span
              className="question-label-new"
              title={intl.formatMessage({ id: "general.newly_added" })}
            >
              {yearAdded}
            </span>
          )}
        </Form.Label>

        {enableReadingList && question.entity && (
          <AddToList {...props} label={label} id={question.id} />
        )}

        {/* <span className="form-label-number">
        {sectionNumber}.{questionNumber}
      </span> */}
      </h3>
    </legend>
  );
};

export const FormItemDescription = (
  props: FormItemProps & { section: SectionMetadata }
) => {
  const { question } = props;
  const { entity } = question;
  const intl = useIntlContext();
  const intlIds = getQuestioni18nIds({ ...props });
  const i18nDescription = intl.formatMessage({ id: intlIds.description });
  const entityDescription = entity?.descriptionHtml || entity?.descriptionClean;
  return i18nDescription ? (
    <div className="form-item-description">
      <FormattedMessage id={intlIds.description} />
    </div>
  ) : entityDescription ? (
    <p className="form-item-description">
      <span
        dangerouslySetInnerHTML={{
          __html: entityDescription,
        }}
      />
    </p>
  ) : null;
};

export const FormItemLimit = ({ question }: FormItemProps) => {
  const { limit } = question;
  return limit ? (
    <div className="form-item-limit">
      <FormattedMessage values={{ limit }} id="general.pick_up_to" />
    </div>
  ) : null;
};

export const FormItemNote = (
  props: FormItemProps & { section: SectionMetadata }
) => {
  const intl = useIntlContext();
  const intlIds = getQuestioni18nIds({ ...props });
  const note = intl.formatMessage({ id: intlIds.note });
  return note ? (
    <FormattedMessage className="form-note" id={intlIds.note} />
  ) : null;
};
