import { StyleSheet, css } from "aphrodite";
import ReactTooltip from "react-tooltip";
import Button from "../Form/Button";
import colors from "../../config/themes/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/pro-regular-svg-icons";
import { createVote } from "./api/votes";
import { ID } from "~/config/types/root_types";
import { PredictionMarketDetails, PredictionMarketVote } from "./lib/types";
import { ReactElement, useMemo, useState } from "react";
import PermissionNotificationWrapper from "../PermissionNotificationWrapper";
import { captureEvent } from "~/config/utils/events";
import { faCaretDown, faCaretUp } from "@fortawesome/pro-solid-svg-icons";
import { breakpoints } from "~/config/themes/screen";
import FormInput from "../Form/FormInput";
import ResearchCoinIcon from "../Icons/ResearchCoinIcon";
import predMarketUtils from "./lib/util";

export type PredictionMarketVoteFormProps = {
  paperId: ID;
  predictionMarket: PredictionMarketDetails;
  onVoteCreated?: (v: PredictionMarketVote) => void;
  onVoteUpdated?: (v: PredictionMarketVote, prev: PredictionMarketVote) => void;
  isCurrentUserAuthor?: boolean;
  refreshKey?: number;
};

type Fields = {
  betAmount?: string;
};
const defaultFields: Fields = {
  betAmount: undefined,
};

const PredictionMarketVoteForm = ({
  paperId,
  predictionMarket,
  onVoteCreated,
  isCurrentUserAuthor = false,
}: PredictionMarketVoteFormProps): ReactElement => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vote, setVote] = useState<"YES" | "NO" | null>(null);
  const [fields, setFields] = useState<Fields>(defaultFields);
  const [fieldErrors, setFieldErrors] = useState<Fields>(defaultFields);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const potentialPayout = useMemo(() => {
    if (vote === null) {
      return 0;
    }
    return predMarketUtils.computePotentialPayout({
      pool: predictionMarket.bets,
      userAmount: parseInt(fields.betAmount || "0", 10),
      userVote: vote === "YES",
      addUserAmountToPool: true,
    });
  }, [vote, fields]);

  const handleSelectOption = (v: "YES" | "NO") => {
    if (isFormOpen && v === vote) {
      setIsFormOpen(false);
      setVote(null);
      return;
    }
    setVote(v);
    setFields(defaultFields);
    setFieldErrors(defaultFields);
    setIsFormOpen(true);
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFields({
      ...fields,
      [name]: value,
    });
    setFieldErrors({
      ...fieldErrors,
      [name]: undefined,
    });
  };

  const handleSubmit = async () => {
    if (vote === null || isSubmitting) {
      return;
    }
    setIsSubmitting(true);

    let parsedBetAmount: number | undefined = undefined;
    if (fields.betAmount) {
      parsedBetAmount = parseInt(fields.betAmount, 10);
      if (isNaN(parsedBetAmount)) {
        setFieldErrors({
          ...fieldErrors,
          betAmount: "Must be a valid number.",
        });
        return;
      }
    }

    if (parsedBetAmount === undefined || parsedBetAmount < 1) {
      setFieldErrors({
        ...fieldErrors,
        betAmount: "Must be greater than 0.",
      });
      return;
    }

    try {
      const { vote: v } = await createVote({
        paperId,
        predictionMarketId: predictionMarket.id,
        vote,
        betAmount: parsedBetAmount,
      });

      if (onVoteCreated && v) {
        onVoteCreated(v);
        setIsFormOpen(false);
        setVote(null);
        setSubmitError(null);
        setFields(defaultFields);
      }
    } catch (error) {
      captureEvent({
        error,
        msg: "Failed to create prediction vote",
        data: {
          predictionMarketId: predictionMarket.id,
          vote,
          betAmount: parsedBetAmount,
        },
      });
      setSubmitError("Failed to create vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={css(styles.container)}>
      <ReactTooltip
        effect="solid"
        className={css(styles.tooltip)}
        id="link-tooltip"
      />
      <div className={css(styles.header)}>
        <div className={css(styles.title)}>
          Do you think this paper will replicate?
        </div>
        <div
          data-tip="Do you think an independent researcher/lab can produce results that confirm the conclusion(s) of the paper."
          data-for="link-tooltip"
          className={css(styles.tooltipIcon)}
        >
          <FontAwesomeIcon
            icon={faCircleInfo}
            color={colors.MEDIUM_GREY2(1)}
            fontSize={12}
          />
        </div>
      </div>
      {isCurrentUserAuthor && (
        <div className={css(styles.cantVoteText)}>
          As the author of this paper, you cannot vote on the prediction market.
        </div>
      )}
      {!isCurrentUserAuthor && (
        <div className={css(styles.buttons)}>
          <Button
            label={
              <span>
                Vote YES&nbsp;&nbsp;
                <FontAwesomeIcon
                  icon={faCaretUp}
                  style={{ transform: "translateY(1.2px)" }}
                />
              </span>
            }
            fullWidth
            onClick={() => handleSelectOption("YES")}
            variant={isFormOpen && vote === "YES" ? "outlined" : "contained"}
            customButtonStyle={[
              styles.button,
              isFormOpen && vote === "NO"
                ? styles.greenButtonUnselected
                : styles.greenButton,
            ]}
          />
          <Button
            label={
              <span>
                Vote NO&nbsp;&nbsp;
                <FontAwesomeIcon icon={faCaretDown} />
              </span>
            }
            fullWidth
            onClick={() => handleSelectOption("NO")}
            variant={isFormOpen && vote === "NO" ? "outlined" : "contained"}
            customButtonStyle={[
              styles.button,
              isFormOpen && vote === "YES"
                ? styles.redButtonUnselected
                : styles.redButton,
            ]}
          />
        </div>
      )}
      {isFormOpen && vote !== null && (
        <div>
          <ReactTooltip
            id="commission"
            effect="solid"
            className={css(bountyTooltip.tooltipContainer)}
            delayShow={150}
          >
            <div className={css(bountyTooltip.bodyContainer)}>
              <div className={css(bountyTooltip.desc)}>
                <div>7% of bet amount will be paid to ResearchHub Inc</div>
              </div>
            </div>
          </ReactTooltip>
          <div className={css(styles.formWrapper)}>
            <div className={css(styles.inputWrapper)}>
              <FormInput
                label="Amount"
                placeholder="0"
                onChange={(_, v) => handleInputChange("betAmount", v)}
                value={fields.betAmount}
                error={fieldErrors.betAmount}
                type="number"
                containerStyle={styles.inputContainer}
                labelStyle={styles.labelStyle}
                inputStyle={styles.inputStyle}
                autoFocus
              />
              <div className={css(styles.amountDetails)}>
                <ResearchCoinIcon
                  overrideStyle={styles.rscIconLarge}
                  height={18}
                  width={18}
                />
                <span className={css(styles.rscTitle)}>RSC</span>
                <span className={css(styles.fee)}>
                  Platform Fee (7%)
                  <span
                    data-tip={""}
                    data-for="commission"
                    className={css(styles.tooltipIcon)}
                  >
                    {<FontAwesomeIcon icon={faCircleInfo} fontSize={12} />}
                  </span>
                </span>
              </div>
            </div>
            <div className={css(styles.payoutWrapper)}>
              <div className={css(styles.labelStyle)}>Payout if Correct</div>
              <div className={css([styles.rscToDisplay, styles.payout])}>
                <ResearchCoinIcon
                  overrideStyle={styles.rscIconLarge}
                  height={18}
                  width={18}
                />
                <span className={css(styles.rscTitle)}>
                  {potentialPayout.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          <div className={css(styles.bottomFormWrapper)}>
            <PermissionNotificationWrapper
              loginRequired
              modalMessage="vote"
              onClick={handleSubmit}
              hideRipples
              styling={styles.bottomButton}
            >
              <Button
                label={`Vote ${vote ? "YES" : "NO"}`}
                customButtonStyle={styles.bottomButton}
                disabled={isSubmitting}
              />
            </PermissionNotificationWrapper>
            {submitError && (
              <div className={css(styles.error)}>{submitError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const bountyTooltip = StyleSheet.create({
  tooltipContainer: {
    textAlign: "center",
    width: 300,
    padding: 12,
  },
  tooltipContainerSmall: {
    width: "auto",
  },
  bodyContainer: {},
  title: {
    textAlign: "center",
    color: "white",
    fontWeight: 500,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    lineHeight: "20px",
  },
});

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: "none",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    paddingRight: 2,
  },
  cantVoteText: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.MEDIUM_GREY2(1),
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    gap: 8,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "column",
    },
  },
  button: {
    boxSizing: "border-box",
    width: "100%",
  },
  greenButton: {
    color: "white",
    backgroundColor: colors.PASTEL_GREEN(),
    border: "none",
    ":hover": {
      backgroundColor: colors.PASTEL_GREEN(0.9),
    },
  },
  greenButtonUnselected: {
    color: colors.PASTEL_GREEN(),
    backgroundColor: "white",
    border: `solid 1px ${colors.PASTEL_GREEN()}`,
    paddingTop: 5,
    paddingBottom: 5,
  },
  redButton: {
    color: "white",
    backgroundColor: colors.PASTEL_RED(),
    border: "none",
    ":hover": {
      backgroundColor: colors.PASTEL_RED(0.9),
    },
  },
  redButtonUnselected: {
    color: colors.PASTEL_RED(),
    backgroundColor: "white",
    border: `solid 1px ${colors.PASTEL_RED()}`,
    paddingTop: 5,
    paddingBottom: 5,
  },

  tooltip: {
    width: 300,
  },
  tooltipIcon: {
    cursor: "pointer",
    marginLeft: 4,
  },
  formWrapper: {
    marginTop: 24,
    backgroundColor: colors.INPUT_BACKGROUND_GREY,
    borderRadius: 4,
    padding: 24,
    display: "flex",
    flexDirection: "row",
    gap: 16,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "column",
      gap: 32,
    },
  },
  payoutWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  payout: {
    height: 51,
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      height: 32,
    },
  },
  inputWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
  },
  inputContainer: {
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
    maxWidth: 124,
  },
  labelStyle: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.MEDIUM_GREY2(),
  },
  inputStyle: {
    textAlign: "right",
  },

  amountDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    transform: "translateY(41px)",
  },
  rscTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  fee: {
    fontSize: 12,
    color: colors.MEDIUM_GREY2(),
    marginLeft: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  rscToDisplay: {},
  rscIconLarge: { height: 18, marginRight: 6 },

  bottomFormWrapper: {
    marginTop: 24,
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 32,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      flexDirection: "column-reverse",
      gap: 16,
    },
  },
  bottomButton: {
    width: 140,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      width: "100%",
    },
  },

  error: {
    color: colors.RED(),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    marginBottom: 16,
  },
});

export default PredictionMarketVoteForm;
