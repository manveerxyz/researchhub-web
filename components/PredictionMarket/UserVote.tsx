import { css, StyleSheet } from "aphrodite";
import { styles as linkStyles } from "../ALink";
import colors from "../../config/themes/colors";
import { PredictionMarketDetails, PredictionMarketVote } from "./lib/types";
import { ReactElement } from "react";
import ResearchCoinIcon from "../Icons/ResearchCoinIcon";
import predMarketUtils from "./lib/util";
import { breakpoints } from "~/config/themes/screen";

export type PredictionMarketUserVoteProps = {
  vote: PredictionMarketVote;
  market: PredictionMarketDetails;
};

const PredictionMarketUserVote = ({
  vote,
  market,
}: PredictionMarketUserVoteProps): ReactElement => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.column)}>
        <div className={css(styles.columnHeader)}>Your Vote</div>
        <div className={css(styles.columnContent)}>
          {vote.vote === "YES" ? (
            <div className={css(styles.greenText)}>Yes</div>
          ) : (
            <div className={css(styles.redText)}>No</div>
          )}
        </div>
      </div>
      <div className={css(styles.column)}>
        <div className={css(styles.columnHeader)}>Amount</div>
        <div className={css(styles.columnContent)}>
          <ResearchCoinIcon width={18} height={18} />
          <span className={css(styles.betText)}>
            {(vote.betAmount || 0).toFixed(0)}
            &nbsp;RSC
          </span>
        </div>
      </div>
      <div className={css(styles.column)}>
        <div className={css(styles.columnHeader)}>Payout if Correct</div>
        <div className={css(styles.columnContent)}>
          <ResearchCoinIcon width={18} height={18} />
          <span className={css(styles.betText)}>
            {predMarketUtils
              .computePotentialPayout({
                pool: market.bets,
                userAmount: vote.betAmount || 0,
                userVote: vote.vote === "YES",
              })
              .toFixed(0)}
            &nbsp;RSC
          </span>
        </div>
      </div>
      <div className={css(styles.column)}>
        <div className={css(styles.columnHeader)}></div>
        <div className={css(styles.columnContent)}>
          <div className={css(styles.withdrawWrapper)}>
            <span
              className={css([
                linkStyles.linkThemeSolidPrimary,
                styles.boldLink,
              ])}
            >
              Withdraw
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
    },
  },
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 8,
    height: 48,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: "auto",
      width: "100%",
    },
  },

  columnHeader: {
    fontSize: 14,
    color: colors.MEDIUM_GREY2(),
  },
  columnContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },

  betText: {
    fontSize: 18,
    fontWeight: 400,
    marginLeft: 8,
    color: colors.ORANGE_LIGHT2(),
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      fontSize: 16,
    },
  },
  greenText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.PASTEL_GREEN(),
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      fontSize: 16,
    },
  },
  redText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.PASTEL_RED(),
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      fontSize: 16,
    },
  },
  withdrawWrapper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "row",
      justifyContent: "flex-start",
      paddingTop: 8,
    },
  },
  boldLink: {
    fontWeight: 500,
  },
});

export default PredictionMarketUserVote;
