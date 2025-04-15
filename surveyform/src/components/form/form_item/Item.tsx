/*

Layout for a single form item

*/
"use client";
import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  RefObject,
} from "react";

import Form from "react-bootstrap/Form";
import { FormInputProps } from "../typings";
import { CommentTrigger, CommentInput } from "./Comment";
import { getFormPaths } from "@devographics/templates";

import { useFormStateContext } from "../FormStateContext";
import { useFormPropsContext } from "../FormPropsContext";
import { DbPathsEnum } from "@devographics/types";
import { FormItemTitle } from "./Title";
import { FormItemDescription } from "./Description";
import { FormItemCheckAll } from "./CheckAll";
import { FormItemNote } from "./Note";
import { SkipButton } from "./Skip";
import { FormItemIndications } from "./Indications";

export interface FormItemProps extends FormInputProps {
  children: ReactNode;
  showMore?: boolean;
  showOther?: boolean;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  className?: string;
  isInvalid?: boolean;
}

export const FormItem = function FormItem(
  props: { ref: RefObject<HTMLDivElement> } & FormItemProps
) {
  // TODO: using response here makes the component rerender for nothing
  // TODO: depending on stateStuff forces component to rerender systematically
  const { stateStuff, response } = useFormStateContext();
  const { section, edition, readOnly } = useFormPropsContext();
  const {
    ref: parentRef,
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

  const { itemPositions, setItemPositions, reactToChanges, setReactToChanges } =
    stateStuff;

  // const { allowComment } = question;
  // allow comments on all questions
  const allowComment = true;

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
  const myRef = parentRef || childRef;
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

  if (allowComment && !commentPath)
    console.warn(
      `Allowed comments for component of template ${question.template}, but it doesn't have a commentPath`
    );
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
            <FormItemIndications {...props} />
            <div className="form-item-input">{children}</div>
            <FormItemNote {...props} />

            {allowComment && commentPath && (
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
};
