"use client";
import React, { useState } from "react";
import sampleSize from "lodash/sampleSize.js";
import isNil from "lodash/isNil.js";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { useFormContext } from "@devographics/react-form";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { FormItem } from "~/form/components/elements/FormItem";
import { TooltipTrigger } from "~/core/components/ui/TooltipTrigger";
import { Button } from "~/core/components/ui/Button";

/*

Helpers

*/
const sampleSizeAndRemove = (array, n) => {
  const sample = sampleSize(array, n);
  const remaining = array.filter((a) => !sample.includes(a));
  return [sample, remaining];
};

const pickTwo = (array) => sampleSizeAndRemove(array, 2);

const initResults = () => {
  let zeroToSeven = [0, 1, 2, 3, 4, 5, 6, 7];
  // 4 x first round matches + 2 x second round matches + 1 third round match = 7 total matches
  const matchCount = 7;
  const results: Array<any> = [];
  for (let i = 0; i < matchCount; i++) {
    const [sample, remaining] = pickTwo(zeroToSeven);
    zeroToSeven = remaining;
    results[i] = sample;
  }
  return results;
};

// match 0 determines first participant of match 4, match
// 1 determines second participant of match 4, etc.
const matchTable = {
  0: [4, 0],
  1: [4, 1],
  2: [5, 0],
  3: [5, 1],
  4: [6, 0],
  5: [6, 1],
};

// based on a match participant, find out what match was won to get there
const reverseMatchTable = {
  4: {
    0: 0,
    1: 1,
  },
  5: {
    0: 2,
    1: 3,
  },
  6: {
    0: 4,
    1: 5,
  },
};

// for a matchIndex and playerIndex, get the match that was just won by that player
const getWonMatchIndex = (matchIndex, playerIndex) => {
  const wonMatchIndex = reverseMatchTable[matchIndex][playerIndex];
  return wonMatchIndex;
};

const getItemClasses = (vars) => {
  const c = ["bracket-item"];
  Object.keys(vars).forEach((varName) => {
    if (vars[varName]) {
      c.push(`bracket-item-${varName.replace("is", "").toLowerCase()}`);
    }
  });
  return c;
};

/*

Main Component

*/

const Bracket = (
  {
    inputProperties,
    itemProperties,
    options: _options,
    path,
  } /* FormInputProps*/ /** TODO The props are those of a Vulcan custom form input */
) => {
  const { updateCurrentValues } = useFormContext();
  const { value } = inputProperties;
  const [results, setResults] = useState(
    isEmpty(value) ? initResults() : value
  );

  // add index to all options since we use that to keep track of them
  const options = _options.map((o, index) => ({ ...o, index }));

  const startOver = () => {
    setResults(initResults());
  };

  const pickWinner = (matchIndex, playerIndex) => {
    const [p1Index, p2Index] = results[matchIndex];
    const winnerIndex = playerIndex === 0 ? p1Index : p2Index;
    const matchResult = [p1Index, p2Index, winnerIndex];

    const newResults = cloneDeep(results);
    newResults[matchIndex] = matchResult;

    // add the winner to the next round using the matchTable to figure out what round that should be.
    // note: no need to do this if this is the last round
    if (matchTable[matchIndex]) {
      const [nextRoundMatchIndex, nextRoundPlayerIndex] =
        matchTable[matchIndex];
      const nextRoundMatchResult = newResults[nextRoundMatchIndex];
      nextRoundMatchResult[nextRoundPlayerIndex] = winnerIndex;
    }
    setResults(newResults);
    updateCurrentValues({ [path]: newResults });
  };

  // cancel a match
  const cancelMatch = (matchIndex, playerIndex, isOverallWinner) => {
    const newResults = cloneDeep(results);
    if (isOverallWinner) {
      // remove winner (3rd place array item) from current match
      newResults[matchIndex].splice(2, 1);
    } else {
      const wonMatchIndex = getWonMatchIndex(matchIndex, playerIndex);
      // remove item from current match
      delete newResults[matchIndex][playerIndex];
      // remove winner (3rd place array item) from previous match
      newResults[wonMatchIndex].splice(2, 1);
    }
    setResults(newResults);
    updateCurrentValues({ [path]: newResults });
  };

  const props = {
    options,
    results,
    pickWinner,
    cancelMatch,
    startOver,
  };

  return (
    <FormItem
      path={inputProperties.path}
      label={inputProperties.label}
      {...itemProperties}
    >
      <div className="bracket">
        <BracketLegend {...props} />
        <BracketResults {...props} />
      </div>
    </FormItem>
  );
};

/*

Sub Components

*/

// bracket legend
const BracketLegend = ({ options }) => {
  return (
    <table className="bracket-legend">
      <tbody>
        {options.map(({ value, intlId }, index) => (
          <tr className="bracket-legend-item" key={value}>
            <th className="bracket-legend-heading">
              <FormattedMessage id={intlId} />
            </th>
            <td className="bracket-legend-description">
              <FormattedMessage id={`${intlId}.description`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// live bracket results
const BracketResults = (props) => {
  return (
    <div className="bracket-results">
      <BracketMatchGroup {...props} matchIndexes={[0, 1, 2, 3]} level={1} />
      <BracketMatchGroup {...props} matchIndexes={[4, 5]} level={2} />
      <BracketMatchGroup {...props} matchIndexes={[6]} level={3} />
      <BracketMatchGroup
        {...props}
        matchIndexes={[6]}
        isOverallWinner={true}
        level={4}
      />
    </div>
  );
};

// a match group within the bracket
const BracketMatchGroup = (props) => {
  const { matchIndexes, ...rest } = props;
  const { results, isOverallWinner, level } = rest;
  return (
    <div
      className={`bracket-matchgroup bracket-matchgroup-level${level} bracket-matchgroup-${
        isOverallWinner ? "overall-winner" : ""
      }`}
    >
      <p className="visually-hidden">
        {isOverallWinner ? (
          <FormattedMessage id="bracket.result" />
        ) : (
          <>
            <FormattedMessage id="bracket.round" /> {level}
          </>
        )}
      </p>
      {matchIndexes.map((matchIndex) => (
        <BracketMatch
          {...rest}
          result={results[matchIndex]}
          matchIndex={matchIndex}
          key={matchIndex}
        />
      ))}
    </div>
  );
};

// bracket pair; or single winner
const BracketMatch = (props) => {
  const { options, result, index, isOverallWinner = false } = props;
  const [p1Index, p2Index, winnerIndex] = result;
  const p1 = options[p1Index];
  const p2 = options[p2Index];
  const winner = options[winnerIndex];
  // disable the buttons if
  // A) player 1 is not defined yet
  // B) player 2 is not defined yet
  // C) a winner has already been picked (except for overall winner)
  const isDisabled =
    isNil(result[0]) ||
    isNil(result[1]) ||
    (!isNil(result[2]) && !isOverallWinner);

  const p = {
    ...props,
    isDisabled,
  };

  return isOverallWinner ? (
    <div key={index} className="bracket-match">
      <BracketItem
        {...p}
        playerIndex={0}
        player={winner}
        isOverallWinner={true}
      />
    </div>
  ) : (
    <fieldset key={index} className="bracket-match">
      <legend className="visually-hidden">
        <FormattedMessage id={p1?.intlId} />,{" "}
        <FormattedMessage id="bracket.vs" />.{" "}
        <FormattedMessage id={p2?.intlId} />
      </legend>
      <div className="bracket-match">
        <BracketItem
          {...p}
          playerIndex={0}
          player={p1}
          isWinner={!isNil(winnerIndex) && p1Index === winnerIndex}
        />
        <div className="bracket-spacer" />
        <BracketItem
          {...p}
          playerIndex={1}
          player={p2}
          isWinner={!isNil(winnerIndex) && p2Index === winnerIndex}
        />
      </div>
    </fieldset>
  );
};

// bracket result item
const BracketItem = (props) => {
  const {
    player,
    isDisabled = false,
    isWinner,
    isOverallWinner,
    results,
    level,
    matchIndex,
  } = props;

  // if this is the item located in the last position of the last match, it's the champion
  const isChampion = player && player.index === results?.[6]?.[2];
  // after first round every player has won at least a match
  const isDefending = player && level > 1;
  // is this item active?
  const isActive = !isDisabled;
  // has a winner been picked for the current match or not
  const currentMatchHasWinner = !!results[matchIndex][2];
  // if the current match doesn't have a winner, or it's the overall winner, we're at the edge
  const isEdge = !currentMatchHasWinner || isOverallWinner;

  const classnames = getItemClasses({
    isOverallWinner,
    isEdge,
    isWinner,
    isDisabled,
    isActive,
    isDefending,
    isChampion,
  });

  // an item can be cancelled if it's at the edge; except for first level items
  const canCancel = player && isDefending && isEdge;

  const p = { ...props, canCancel };

  return player ? (
    <div className={classnames.join(" ")}>
      <div className="bracket-item-inner">
        {isOverallWinner ? (
          <BracketItemOverallWinner {...p} />
        ) : (
          <BracketItemButton {...p} />
        )}
      </div>
    </div>
  ) : (
    <EmptyBracketItem classnames={classnames} />
  );
};

// wrap an item with a description or not based on its availability
const WrapWithDescriptionTooltip = ({ player, children }) => {
  const intl = useIntlContext();
  const description =
    player && intl.formatMessage({ id: `${player.intlId}.description` });

  //return children;
  return description ? (
    <TooltipTrigger
      trigger={<div className="bracket-item-tooltip-trigger">{children}</div>}
    >
      <div className="bracket-item-details" aria-hidden="true">
        {description}
      </div>
    </TooltipTrigger>
  ) : (
    children
  );
};

// bracket item button
const BracketItemButton = (props) => {
  const {
    player,
    isDisabled,
    pickWinner,
    matchIndex,
    playerIndex,
    result,
    canCancel,
  } = props;
  return (
    <div className="bracket-item-button-wrapper">
      <WrapWithDescriptionTooltip player={player}>
        <button
          name={`match-index-${result.join("_")}-${matchIndex}`}
          id={`bracket-item-${props.player.intlId}`}
          key={`bracket-item-${props.player.intlId}`}
          aria-pressed={isDisabled}
          className="bracket-item-button btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            pickWinner(matchIndex, playerIndex);
          }}
        >
          <FormattedMessage id={props.player.intlId} />
          <span className="visually-hidden">
            (
            <FormattedMessage id={`${props.player.intlId}.description`} />)
          </span>
        </button>
      </WrapWithDescriptionTooltip>
      {canCancel && <BracketItemCancel {...props} />}
    </div>
  );
};

interface BracketItemCancelProps {
  matchIndex?: number;
  playerIndex?: number;
  isOverallWinner?: boolean;
  cancelMatch: (
    matchIndex?: number,
    playerIndex?: number,
    isOverallWinnder?: boolean
  ) => void;
}
// cancel a match
const BracketItemCancel = ({
  matchIndex,
  playerIndex,
  isOverallWinner,
  cancelMatch,
}: BracketItemCancelProps) => {
  return (
    <TooltipTrigger
      trigger={
        <button
          className="bracket-item-cancel"
          onClick={(e) => {
            e.preventDefault();
            cancelMatch(matchIndex, playerIndex, isOverallWinner);
          }}
        >
          <span>
            <span className="visually-hidden">
              <FormattedMessage id="bracket.cancel" />
            </span>
            <BracketItemCancelIcon />
          </span>
        </button>
      }
    >
      <div className="bracket-item-details" aria-hidden="true">
        <FormattedMessage id="bracket.cancel" />
      </div>
    </TooltipTrigger>
  );
};

// cancel (close) icon
const BracketItemCancelIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M17.25 6.75L6.75 17.25"
    ></path>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M6.75 6.75L17.25 17.25"
    ></path>
  </svg>
);

// overall winner of the entire bracket (not a button)
const BracketItemOverallWinner = (
  props: {
    player?: any;
    canCancel?: boolean;
  } & BracketItemCancelProps
) => {
  const { player, canCancel } = props;
  return (
    <div className="bracket-item-button-wrapper">
      <WrapWithDescriptionTooltip player={player}>
        <div className="bracket-item-button bracket-item-button-overall-winner">
          <div className="bracket-item-label">
            <FormattedMessage id={player?.intlId} />
          </div>
          {/* <BracketStartOver {...props} /> */}
        </div>
      </WrapWithDescriptionTooltip>
      {canCancel && <BracketItemCancel {...props} />}
    </div>
  );
};

// start over (not used)
export const BracketStartOver = ({ startOver }: { startOver: () => void }) => {
  return (
    <Button
      className="bracket-startover"
      onClick={() => {
        startOver();
      }}
    >
      <FormattedMessage id="bracket.start_over" />
    </Button>
  );
};

// empty bracket result item
const EmptyBracketItem = ({ classnames }: { classnames: Array<string> }) => {
  return (
    <div className={[...classnames, "bracket-item-empty"].join(" ")}>
      <div className="bracket-item-inner">
        <span aria-hidden="true">...</span>
        <span className="visually-hidden">
          <FormattedMessage id="bracket.empty_bracket" />
        </span>
      </div>
    </div>
  );
};

export default Bracket;
