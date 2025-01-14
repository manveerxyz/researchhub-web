import { customModalStyle } from "./styles/projects_upsert_modal_style";
import {
  emptyFncWithMsg,
  filterNull,
  nullthrows,
} from "~/config/utils/nullchecks";
import { getCurrentUserCurrentOrg } from "~/components/contexts/OrganizationContext";
import { ID } from "~/config/types/root_types";
import {
  ReactElement,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Typography } from "@mui/material";
import { upsertReferenceProject } from "./api/upsertReferenceProject";
import { useReferenceActiveProjectContext } from "./context/ReferenceActiveProjectContext";
import { useReferenceProjectUpsertContext } from "./context/ReferenceProjectsUpsertContext";
import colors from "~/config/themes/colors";
import DropdownMenu from "../../menu/DropdownMenu";
import dynamic from "next/dynamic";
import ReferenceCollaboratorsSection from "./ReferenceCollaboratorsSection";
import ReferenceItemFieldInput from "../../form/ReferenceItemFieldInput";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinnerThird } from "@fortawesome/pro-light-svg-icons";
import { useReferencesTableContext } from "../reference_table/context/ReferencesTableContext";

const BaseModal = dynamic(() => import("~/components/Modals/BaseModal"));

type ComponentProps = {
  onCloseModal?: (event?: SyntheticEvent) => void;
  onUpsertSuccess?: (result) => void;
};

export default function ReferenceProjectsUpsertModal({
  onCloseModal,
  onUpsertSuccess,
}: ComponentProps): ReactElement {
  const currentOrg = getCurrentUserCurrentOrg();
  const {
    isModalOpen,
    projectValue,
    resetContext,
    setProjectValue,
    upsertPurpose,
  } = useReferenceProjectUpsertContext();

  const { resetProjectsFetchTime, setActiveProject, flattenCollaborators } =
    useReferenceActiveProjectContext();
  const router = useRouter();
  const nameChanged = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setReferenceTableRowData } = useReferencesTableContext();

  useEffect(() => {
    if (!isModalOpen) {
      nameChanged.current = false;
    }
  }, [isModalOpen]);

  const handleCloseModal = (event?: SyntheticEvent) => {
    onCloseModal && onCloseModal(event);
    resetContext!();
  };

  const handleSubmit = () => {
    const { collaborators, isPublic, projectID, projectName } = projectValue;
    setIsLoading(true);
    const formattedPayload = {
      project: upsertPurpose === "update" ? projectID : undefined,
      parent: upsertPurpose === "create_sub_project" ? projectID : undefined,
      collaborators: {
        editors: filterNull(
          collaborators.map((collaborator): ID => {
            if (collaborator.role === "EDITOR") {
              return collaborator.id;
            }
          })
        ),
        viewers: filterNull(
          collaborators.map((collaborator): ID => {
            if (collaborator.role !== "EDITOR") {
              return collaborator.id;
            }
          })
        ),
      },
      is_public: isPublic,
      organization: currentOrg?.id,
      project_name: nullthrows(
        projectName?.trim(),
        "Folder name may not be null"
      ),
    };

    upsertReferenceProject({
      onSuccess: (result) => {
        resetProjectsFetchTime();
        onUpsertSuccess && onUpsertSuccess(result);
        handleCloseModal();
        setIsLoading(false);

        if (!router.query.slug) {
          setReferenceTableRowData([]);
          const proj = { ...result, projectID: result.id };
          proj.flattenedCollaborators = flattenCollaborators(proj);
          setActiveProject(proj);
          router.push(
            `/reference-manager/${
              router.query.organization
            }/${encodeURIComponent(result.slug)}`
          );
        } else if (nameChanged) {
          const slugsTilNow = router.query.slug
            .slice(0, router.query.slug.length - 1)
            .join("/");

          router.replace(
            `/reference-manager/${
              router.query.organization
            }/${slugsTilNow}/${encodeURIComponent(result.slug)}`
          );
        }
      },
      onError: emptyFncWithMsg,
      payload: formattedPayload,
      upsertPurpose,
    });
  };

  const modalTitle =
    upsertPurpose === "update" ? "Update folder" : "Create folder";

  return (
    <BaseModal
      children={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <ReferenceItemFieldInput
            formID="project-name"
            label={"Folder name"}
            onChange={(projectName: string) => {
              setProjectValue({ ...projectValue, projectName });
            }}
            placeholder="Enter folder name"
            required
            value={projectValue.projectName}
          />
          <div
            style={{
              alignItems: "center",
              display: "flex",
              height: "100%",
              justifyContent: "space-betweent",
              marginBottom: "16px",
              width: "100%",
            }}
          >
            <Typography
              color="rgba(36, 31, 58, 1)"
              fontSize="14px"
              fontWeight={600}
              lineHeight="22px"
              letterSpacing={0}
              mb="4px"
              sx={{ background: "transparent" }}
              width="100%"
            >
              {"Folder access "}
              <span style={{ color: colors.BLUE() }}>{"*"}</span>
            </Typography>
            <DropdownMenu
              menuItemProps={[
                {
                  itemLabel: "Everyone in org",
                  onClick: (event: SyntheticEvent): void => {
                    setProjectValue({ ...projectValue, isPublic: true });
                  },
                },
                {
                  itemLabel: "Collaborators only",
                  onClick: (event: SyntheticEvent): void => {
                    setProjectValue({ ...projectValue, isPublic: false });
                  },
                },
              ]}
              menuLabel={
                <div style={{ width: "100%", minWidth: 120, padding: 8 }}>
                  {projectValue.isPublic
                    ? "Everyone in org"
                    : "Collaborators only"}
                </div>
              }
              size={"small"}
            />
          </div>
          {/* <ReferenceSwitchInput
            label={"Make it public"}
            isChecked={projectValue.isPublic}
            onSwitch={(isPublic: boolean): void => {
              setProjectValue({ ...projectValue, isPublic });
            }}
            required
          /> */}
          <ReferenceCollaboratorsSection
            label={"Invite collaborators (optional)"}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              margin: "16px 0 -16px",
              width: "100%",
            }}
          >
            <div
              onClick={(event: SyntheticEvent): void => {
                event.preventDefault();
                handleCloseModal(event);
              }}
              style={{
                width: "88px",
                marginLeft: "16px",
                alignItems: "center",
                cursor: "pointer",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                height: "40px",
                borderRadius: "4px",
              }}
            >
              <Typography
                fontSize="14px"
                fontWeight="400"
                color={colors.NEW_BLUE()}
              >
                {"Cancel"}
              </Typography>
            </div>
            <div
              onClick={(event: SyntheticEvent): void => {
                event.preventDefault();
                handleSubmit();
              }}
              style={{
                // width: "88px",
                padding: "0px 16px",
                marginLeft: "16px",
                background: colors.NEW_BLUE(),
                alignItems: "center",
                cursor: "pointer",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                height: "40px",
                borderRadius: "4px",
              }}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinnerThird} spin color="#fff" />
              ) : (
                <Typography fontSize="14px" fontWeight="400" color="#fff">
                  {upsertPurpose === "update" ? "Update" : "Create"}
                </Typography>
              )}
            </div>
          </div>
        </div>
      }
      title={
        <div
          style={{
            display: "flex",
            marginTop: "-24px",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>{modalTitle}</div>
        </div>
      }
      closeModal={handleCloseModal}
      isOpen={isModalOpen}
      modalContentStyle={customModalStyle.modalContentStyle}
      modalStyle={customModalStyle.modalStyle}
    />
  );
}
