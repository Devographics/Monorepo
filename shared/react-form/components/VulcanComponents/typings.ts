import React from "react";

export interface PossibleCoreComponents {
  Loading: any;
  FormattedMessage: any;
  Alert: any;
  Button: any; //React.ComponentType<ButtonProps>;
  Icon: any;
  // TODO: define props more precisely
  LoadingButton: React.ComponentType<any>;
  // Previously from Bootstrap and Mui
  TooltipTrigger: React.ComponentType<any>;
  Dropdown: React.ComponentType<any>;
  Modal: any; // typeof  Modal;
  ModalTrigger: any; // typeof  ModalTrigger;
}
// TODO: differentiate components that are provided out of the box and those that require a UI frameworK?
export interface PossibleFormComponents {
  FormError: any; // FieldErrors
  // From FormComponent
  FormComponentDefault: any;
  /** Alias of the default FormComponent */
  FormComponentText: any;
  FormComponentPassword: any;
  FormComponentNumber: any;
  FormComponentUrl: any;
  FormComponentEmail: any;
  FormComponentTextarea: any;
  FormComponentCheckbox: any;
  FormComponentCheckboxGroup: any;
  FormComponentRadioGroup: any;
  FormComponentSelect: any;
  FormComponentSelectMultiple: any;
  FormComponentDateTime: any;
  FormComponentDate: any;
  // FormComponentDate2: any;
  FormComponentTime: any;
  FormComponentStaticText: any;
  FormComponentLikert: any;
  FormComponentAutocomplete: any;
  FormComponentMultiAutocomplete: any;
  //
  FormComponent: any;
  FormComponentInner: any;
  FormComponentLoader: any;
  FormElement: any;
  FormGroup: any;
  FormGroupLayout: any;
  FormGroupHeader: any;
  // intl
  FormIntlLayout: any;
  FormIntlItemLayout: any;
  FormIntl: any;
  // Layout
  FormErrors: any;
  FormSubmit: any; //React.ComponentType<FormSubmitProps>;
  FormLayout: any;

  // arrays and objects
  FormNestedArray: any;
  FormNestedArrayInnerLayout: any;
  FormNestedArrayLayout: any;
  FormNestedItem: any;
  IconAdd: any;
  IconRemove: any;
  FieldErrors: any;
  FormNestedDivider: any;
  //
  FormNestedItemLayout: any;
  FormNestedObjectLayout: any;
  FormNestedObject: any;
  FormOptionLabel: any; //React.ComponentType<FormOptionLabelProps>;
  // Form
  Form: any;
  SmartForm: any;
  // Used by ui-boostrap and ui-material
  FormItem;
  // flag to detect parent state
  __not_initialized?: boolean;
}

export interface DatatableComponents {
  Datatable: any; // typeof  Datatable;
  // DatatableContents: any; // typeof  DatatableContents
  DatatableAbove: any; // typeof  DatatableAbove;
  DatatableAboveLayout: any; // typeof  DatatableAboveLayout;
  DatatableAboveLeft: any; // typeof  DatatableAboveLeft;
  DatatableAboveRight: any; // typeof  DatatableAboveRight;
  DatatableAboveSearchInput: any; // typeof  DatatableAboveSearchInput;
  DatatableLayout: any; // typeof  DatatableLayout;
  // Contents
  DatatableContents: any; // typeof  DatatableContents;
  DatatableContentsBodyLayout: any; // typeof  DatatableContentsBodyLayout;
  DatatableContentsHeadLayout: any; // typeof  DatatableContentsHeadLayout;
  DatatableContentsInnerLayout: any; // typeof  DatatableContentsInnerLayout;
  DatatableContentsLayout: any; // typeof  DatatableContentsLayout;
  DatatableContentsMoreLayout: any; // typeof  DatatableContentsMoreLayout;
  DatatableEmpty: any; // typeof  DatatableEmpty;
  DatatableLoadMoreButton: any; // typeof  DatatableLoadMoreButton;
  DatatableTitle: any; // typeof  DatatableTitle;
  // Header
  DatatableHeader: any; // typeof  DatatableHeader;
  DatatableHeaderCellLayout: any; // typeof  DatatableHeaderCellLayout;
  // Row
  DatatableRow: any; // typeof  DatatableRow;
  DatatableRowLayout: any; // typeof  DatatableRowLayout;
  // Cell
  DatatableCell: any; // typeof  DatatableCell;
  DatatableCellLayout: any; // typeof  DatatableCellLayout;
  DatatableDefaultCell: any; // typeof  DatatableDefaultCell;
  //  Filter
  DatatableFilter: any; // typeof  DatatableFilter;
  DatatableFilterBooleans: any; // typeof  DatatableFilterBooleans;
  DatatableFilterCheckboxes: any; // typeof  DatatableFilterCheckboxes;
  DatatableFilterContents: any; // typeof  DatatableFilterContents;
  DatatableFilterContentsWithData: any; // typeof  DatatableFilterContentsWithData;
  DatatableFilterDates: any; // typeof  DatatableFilterDates;
  DatatableFilterNumbers: any; // typeof  DatatableFilterNumbers;
  // Sort
  DatatableSorter: any; // typeof  DatatableSorter;
  // Select
  DatatableSelect: any; // typeof  DatatableSelect;
  // SubmitSelect
  DatatableSubmitSelected: any; // typeof  DatatableSubmitSelected;
  // Core
  EditButton: any; // typeof  EditButton;
  EditForm: any; // typeof  EditForm;
  NewButton: any; // typeof  NewButton;
  NewForm: any; // typeof  NewForm;
  DeleteButton: any; // typeof  DeleteButton;
}

export interface CellComponents {
  CardItemSwitcher: any; // typeof  CardItemSwitcher;
  CardItem: any; // any; // typeof   CardItemSwitcher;
  DefaultCell: any; // typeof  DefaultCell;
  UserCell: any; // typeof  UserCell;
  CardItemArray: any; // typeof  CardItemArray;
  CardItemDate: any; // typeof  CardItemDate;
  CardItemDefault: any; // typeof  CardItemDefault;
  CardItemHTML: any; // typeof  CardItemHTML;
  CardItemImage: any; // typeof  CardItemImage;
  CardItemNumber: any; // typeof  CardItemNumber;
  CardItemObject: any; // typeof  CardItemObject;
  CardItemRelationHasMany: any; // typeof  CardItemRelationHasMany;
  CardItemRelationHasOne: any; // typeof  CardItemRelationHasOne;
  CardItemRelationItem: any; // typeof  CardItemRelationItem;
  CardItemString: any; // typeof  CardItemString;
  CardItemURL: any; // typeof  CardItemURL;
}

export type PossibleVulcanComponents = PossibleCoreComponents &
  PossibleFormComponents &
  DatatableComponents &
  CellComponents;
