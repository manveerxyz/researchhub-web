import { ReactElement, useEffect, useState } from "react";
import { PredictionMarketDetails, PredictionMarketVote } from "./lib/types";
import { fetchVotesForUser } from "./api/votes";
import { StyleSheet, css } from "aphrodite";
import CommentPlaceholder from "../Comment/CommentPlaceholder";
import { captureEvent } from "~/config/utils/events";
import colors from "~/config/themes/colors";
import PredictionMarketUserVote from "./UserVote";

export type PredictionMarketVoteFeedProps = {
  market: PredictionMarketDetails;
  includeVotes?: PredictionMarketVote[];
};

const PreviousUserVotes = ({
  market,
  includeVotes = [],
}: PredictionMarketVoteFeedProps): ReactElement => {
  const [votes, setVotes] = useState<PredictionMarketVote[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setIsFetching(true);
    try {
      const { votes } = await fetchVotesForUser({
        predictionMarketId: market?.id,
      });

      if (votes) {
        setVotes(votes);
      }
    } catch (error) {
      captureEvent({
        error,
        msg: "Failed to fetch votes for user.",
        data: { document },
      });
      setError("Failed to fetch previous votes for user.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  useEffect(() => {
    // add `includeVotes` to the votes list if they are not already there
    const newVotes = [...votes];
    includeVotes.forEach((vote) => {
      if (!votes.find((v) => v.id === vote.id)) {
        // put it at the front of the list
        newVotes.unshift(vote);
      }
    });
    setVotes(newVotes);
  }, [includeVotes]);

  if (votes.length === 0) {
    // don't want to show anything if there are no votes
    return <div />;
  }

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.header)}>Your Previous Votes</div>
      {isFetching && (
        <div className={css(styles.placeholderWrapper)}>
          <CommentPlaceholder />
        </div>
      )}
      {error && <div className={css(styles.error)}>{error}</div>}
      {!isFetching && (
        <div className={css(styles.votes)}>
          {votes.map((vote, i) => (
            <>
              <PredictionMarketUserVote
                key={vote.id}
                vote={vote}
                market={market}
              />
              {i !== votes.length - 1 && (
                <div className={css(styles.divider)} />
              )}
            </>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  header: {
    display: "flex",
    fontSize: 12,
    fontWeight: 500,
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.GREY_BORDER}`,
    justifyContent: "space-between",
  },
  placeholderWrapper: {
    marginTop: 15,
  },
  emptyStateWrapper: {
    color: colors.BLACK(0.6),
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    textAlign: "center",
    justifyContent: "center",
    lineHeight: "34px",
    fontSize: 18,
    height: 200,
  },
  votes: {
    display: "flex",
    flexDirection: "column",
    marginTop: 16,
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.GREY_BORDER,
  },

  error: {
    color: colors.RED(),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    marginTop: 16,
  },
});

export default PreviousUserVotes;
