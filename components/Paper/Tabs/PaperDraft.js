import React, { Fragment, useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  ContentState,
  EditorBlock,
  AtomicBlockUtils,
  Modifier,
  RichUtils,
  convertToRaw,
  getDefaultKeyBinding,
  KeyBindingUtil,
  CompositeDecorator,
} from "draft-js";
import { convertFromHTML } from "draft-convert";
import { StyleSheet, css } from "aphrodite";
import PropTypes from "prop-types";
import ReactPlaceholder from "react-placeholder/lib";

// Components
import AbstractPlaceholder from "~/components/Placeholders/AbstractPlaceholder";
import Button from "~/components/Form/Button";

import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import colors from "~/config/themes/colors";
import icons from "~/config/themes/icons";

const { hasCommandModifier } = KeyBindingUtil;

const styleMap = {
  HIGHLIGHT: {
    backgroundColor: colors.BLACK(0.1),
    borderRadius: 2,
  },
  TITLE: {
    padding: "10px 0",
    fontWeight: 500,
    fontSize: 20,
    display: "inline-block",
    lineHeight: 2,
    fontFamily: "Roboto",
    // color: "#000"
  },
  ABSTRACT: {
    fontStyle: "italic",
    fontSize: 14,
    padding: "0px 0 20px",
    display: "inline-block",
    lineHeight: 2,
    whiteSpace: "pre-wrap",
  },
  PARAGRAPH: {
    display: "flex",
    justifyContent: "flex-start",
    color: colors.BLACK(),
    fontWeight: 400,
    fontSize: 16,
    width: "100%",
    lineHeight: 2,
    boxSizing: "border-box",
    "@media only screen and (max-width: 967px)": {
      fontSize: 14,
      width: "100%",
    },
    "@media only screen and (max-width: 415px)": {
      fontSize: 12,
    },
  },
  META: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 300,
    whiteSpace: "normal",
    lineHeight: 1.3,
  },
  BACK: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 300,
    whiteSpace: "normal",
    lineHeight: 1,
  },
  HIDDEN: {
    display: "none",
    height: 0,
    overflow: "hidden",
    visibility: "hidden",
    opacity: 0,
    padding: 0,
    margin: 0,
  },
  DOI: {
    color: colors.BLUE(),
  },
};
class PaperDraft extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      showCommentButton: false,
      focused: false,
      fetching: true,
      expandPaper: false,
    };

    this.decorator = new CompositeDecorator([
      {
        strategy: this.findAnnotatedText,
        component: (props) => <AnnotatedText {...props} />,
      },
    ]);
  }

  componentDidMount() {
    this.fetchHTML();
  }

  fetchHTML = () => {
    fetch(
      API.PAPER({
        paperId: this.props.paperId,
        hidePublic: true,
        route: "pdf_extract_xml_string",
      }),
      API.GET_CONFIG()
    )
      .then(Helpers.checkStatus)
      .then(Helpers.parseJSON)
      .then((res) => {
        try {
          const html = decodeURIComponent(escape(window.atob(res)));
          const blocksFromHTML = convertFromHTML({
            htmlToStyle: (nodeName, node, currentStyle) => {
              switch (nodeName) {
                case "article-title":
                  return currentStyle.add("ARTICLE-TITLE");
                case "title":
                  return currentStyle.add("TITLE");
                case "p":
                case "sec":
                  return currentStyle.add("PARAGRAPH");
                case "abstract":
                // return currentStyle.add("ABSTRACT");
                case "fig":
                case "graphic":
                case "front":
                case "back":
                case "journal":
                  return currentStyle.add("HIDDEN");
                case "article-id":
                  return currentStyle.add("DOI");
                default:
                  return currentStyle.add("META");
              }
            },
          })(html);
          let editorState = EditorState.push(
            this.state.editorState,
            blocksFromHTML
          );
          editorState = EditorState.set(editorState, {
            decorator: this.decorator,
            allowUndo: true,
          });

          this.setState({ editorState, fetching: false });
        } catch {
          this.setState({ fetching: false });
        }
      })
      .catch((err) => {
        this.setState({ fetching: false });
      });
  };

  findAnnotatedText = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges((character) => {
      const entityKey = character.getEntity();
      return entityKey !== null && entityKey === "comment";
    }, callback);
  };

  onChange = (editorState) => {
    this.setState({ editorState }, () => {
      this.handleSelectedText(editorState);
    });
  };

  onFocus = () => {
    // this.setState({ focused: true });
  };

  onBlur = () => {
    // this.setState({
    //   showCommentButton: false,
    //   focused: false
    // })
  };

  insertBlock = () => {
    const { editorState } = this.state;

    const contentState = editorState.getCurrentContent();

    const contentStateWithEntity = contentState.createEntity(
      "COMMENT",
      "IMMUTABLE",
      { a: "b" }
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });

    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        " "
      ),
    });
  };

  handleSelectedText = (editorState) => {
    // const { editorState } = this.state;
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const anchorKey = selection.getAnchorKey();
    const contentBlock = content.getBlockForKey(anchorKey);
    const start = selection.getStartOffset();
    const end = selection.getEndOffset();

    const selectedText = contentBlock.getText().slice(start, end);
    // console.log("selectedText", selectedText)
    if (this.state.focused && (selectedText && selectedText.length)) {
      this.promptAddCommentButton();
    } else {
      this.setState({ showCommentButton: false });
    }
  };

  applyEntityToSelection = () => {
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();

    const newContent = Modifier.applyEntity(content, selection, "comment");
    this.setEditorState(newContent, "apply-entity-comment");
    // this.setState({
    //   promptAddCommentButton: false
    // })
  };

  promptAddCommentButton = () => {
    this.setState({
      showCommentButton: true,
    });
  };

  setComment = (content, selection) => {
    const currentStyle = this.state.editorState.getCurrentInlineStyle();
    const inlineStyle = "HIGHLIGHT";
    let newContent;

    if (currentStyle.has(inlineStyle)) {
      newContent = Modifier.removeInlineStyle(content, selection, inlineStyle);
    } else {
      newContent = Modifier.applyInlineStyle(content, selection, inlineStyle);
    }

    this.setState({
      editorState: EditorState.push(
        this.state.editorState,
        newContent,
        "change-inline-style"
      ),
    });
  };

  setEditorState = (content, changeType) => {
    const editorState = EditorState.push(
      this.state.editorState,
      content,
      changeType
    );

    this.setState({ editorState });
  };

  undo = () => {
    const editorState = EditorState.undo(this.state.editorState);

    this.setState({
      editorState,
    });
  };

  renderShowCommentButton = () => {
    // document.querySelector([
    // const customStyles = {
    //   top:
    // };

    return (
      <div
        className={css(styles.addCommentButton)}
        onClick={this.applyEntityToSelection}
      >
        {icons.commentAltPlus}
      </div>
    );
  };

  blockRenderer = (contentBlock) => {
    const type = contentBlock.getType();
    // if (type === "article") {
    //   return {
    //     component: AnnotatedText,
    //     editable: true,
    //     props: {
    //       foo: "bar"
    //     }
    //   };
    // }
  };

  render() {
    const {
      fetching,
      editorState,
      showCommentButton,
      expandPaper,
    } = this.state;

    return (
      <ReactPlaceholder
        ready={!fetching}
        showLoadingAnimation
        customPlaceholder={
          <div style={{ padding: "30px 0 0 50px" }}>
            <AbstractPlaceholder color="#efefef" />
          </div>
        }
      >
        <div className={css(styles.root, expandPaper && styles.expand)}>
          <Editor
            editorState={editorState}
            onChange={this.onChange}
            customStyleMap={styleMap}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            blockRendererFn={this.blockRenderer}
          />
          {showCommentButton && this.renderShowCommentButton()}
          {!expandPaper && (
            <Fragment>
              <div className={css(styles.blur)} />
              <Button
                hideRipples={true}
                label={"Expand Paper"}
                customButtonStyle={styles.expandButton}
                onClick={() => this.setState({ expandPaper: true })}
              />
            </Fragment>
          )}
        </div>
      </ReactPlaceholder>
    );
  }
}

const AnnotatedText = (props) => {
  return (
    <span {...props} className={css(styles.annotatedText)}>
      {props.children}
    </span>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    paddingRight: 10,
    position: "relative",
    fontFamily: "CharterBT",
    maxHeight: 600,
    overflow: "hidden",
  },
  expand: {
    overflow: "unset",
    maxHeight: "unset",
  },
  title: {
    padding: "30px 0px 0px 50px",
    fontSize: 22,
    fontWeight: 500,
    color: colors.BLACK(),
    display: "flex",
    margin: 0,
    "@media only screen and (max-width: 967px)": {
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 20,
    },
    "@media only screen and (max-width: 500px)": {
      flexDirection: "column",
    },
    "@media only screen and (max-width: 415px)": {
      fontSize: 20,
    },
  },
  annotatedText: {
    backgroundColor: colors.LIGHT_YELLOW(),
    borderRadius: 2,
    cursor: "pointer",
  },
  addCommentButton: {
    position: "absolute",
    right: -40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 18,
    color: colors.BLACK(0.4),
    cursor: "pointer",
    height: 30,
    minHeight: 30,
    width: 30,
    minWidth: 30,
    padding: 2,
    borderRadius: "50%",
    border: "1px solid rgba(36, 31, 58, 0.1)",
    background: "#FAFAFA",
  },
  blur: {
    background:
      "linear-gradient(180deg, rgba(250, 250, 250, 0) 0%, #FCFCFC 86.38%)",
    height: "100%",
    position: "absolute",
    zIndex: 3,
    top: 0,
    width: "100%",
  },
  expandButton: {
    position: "absolute",
    bottom: 100,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 3,
    cursor: "pointer",
    boxSizing: "border-box",
    width: "unset",
    padding: "0px 15px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.14)",
  },
});

export default PaperDraft;
