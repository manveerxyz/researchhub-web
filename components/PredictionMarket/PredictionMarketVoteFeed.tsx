import { Fragment, ReactElement, useEffect, useMemo, useState } from "react";
import PredictionMarketVoteItem from "./PredictionMarketVoteItem";
import { PredictionMarketVote } from "./lib/types";
import { ID } from "~/config/types/root_types";
import { fetchVotes } from "./api/votes";
import { StyleSheet, css } from "aphrodite";
import CommentPlaceholder from "../Comment/CommentPlaceholder";
import { captureEvent } from "~/config/utils/events";
import colors from "~/config/themes/colors";
import Dropdown from "../Form/Dropdown";
import { SortOptionValue, SortOptions } from "./lib/options";
import { breakpoints } from "~/config/themes/screen";

export type PredictionMarketVoteFeedProps = {
  marketId: ID;
  // votes that we want to include, that haven't been fetched yet.
  // we use this to update the UI when a user submits a vote
  includeVotes?: PredictionMarketVote[];
};

const PredictionMarketVoteFeed = ({
  marketId,
  includeVotes = [],
}: PredictionMarketVoteFeedProps): ReactElement => {
  const [votes, setVotes] = useState<PredictionMarketVote[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [selectedSortValue, setSelectedSortValue] = useState<string | null>(
    SortOptions[0].value
  );

  const handleFetch = async ({
    sort = "CREATED_DATE",
  }: {
    sort?: SortOptionValue;
  }) => {
    setIsFetching(true);
    try {
      const { votes } = await fetchVotes({
        predictionMarketId: marketId,
        sort: sort ? `-${sort}` : undefined,
      });

      if (votes) {
        setVotes(votes);
      }
    } catch (error) {
      captureEvent({
        error,
        msg: "Failed to fetch votes",
        data: { document },
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    handleFetch({});
  }, []);

  useEffect(() => {
    // add `includeVotes` to the votes list if they are not already there
    const newVotes = [...votes];
    includeVotes.forEach((vote) => {
      if (!votes.find((v) => v.id === vote.id)) {
        if (selectedSortValue === "CREATED_DATE") {
          // put it at the front of the list
          newVotes.unshift(vote);
        } else if (selectedSortValue === "BET_AMOUNT") {
          // put it where it belongs in the list
          let index = 0;
          while (
            index < newVotes.length &&
            (vote.betAmount || 0) < (newVotes[index].betAmount || 0)
          ) {
            index++;
          }
          newVotes.splice(index, 0, vote);
        }
      }
    });
    setVotes(newVotes);
  }, [includeVotes]);

  const yesVotes = useMemo(
    () => votes.filter((vote) => vote.vote === "YES"),
    [votes]
  );
  const noVotes = useMemo(
    () => votes.filter((vote) => vote.vote === "NO"),
    [votes]
  );

  return (
    <div>
      <div className={css(styles.header)}>
        <Dropdown
          value={selectedSortValue}
          handleSelect={(sval) => {
            setSelectedSortValue(sval);
            setIsFetching(true);
            setVotes([]);
            handleFetch({ sort: sval as SortOptionValue });
          }}
          sortOptions={SortOptions}
        />
      </div>
      {isFetching && (
        <div className={css(styles.placeholderWrapper)}>
          <CommentPlaceholder />
        </div>
      )}
      {!isFetching && (
        <div className={css(styles.votes)}>
          {yesVotes.length > 0 && (
            <div className={css(styles.votesColumn)}>
              {yesVotes.map((vote, i) => (
                <Fragment key={vote.id}>
                  <PredictionMarketVoteItem vote={vote} />
                  {i !== yesVotes.length - 1 && (
                    <div className={css(styles.divider)} />
                  )}
                </Fragment>
              ))}
            </div>
          )}
          <div className={css(styles.votesColumn)}>
            {noVotes.map((vote, i) => (
              <Fragment key={vote.id}>
                <PredictionMarketVoteItem vote={vote} />
                {i !== noVotes.length - 1 && (
                  <div className={css(styles.divider)} />
                )}
              </Fragment>
            ))}
          </div>
          {/* create an empty column so that the "no" votes column is limited to 50% width */}
          {yesVotes.length === 0 && <div className={css(styles.votesColumn)} />}
        </div>
      )}
      {!isFetching && votes.length === 0 && (
        <div className={css(styles.emptyStateWrapper)}>No votes yet.</div>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  header: {
    margin: "32px 0 24px 0",
    display: "flex",
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
    flexDirection: "row",
    gap: 36,
    marginTop: 24,
    [`@media only screen and (max-width: ${breakpoints.medium.str})`]: {
      gap: 24,
    },
  },
  votesColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.GREY_BORDER,
  },
});

export default PredictionMarketVoteFeed;
