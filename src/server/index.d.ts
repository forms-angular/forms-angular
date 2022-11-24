import {Error, Model} from "mongoose";
import {Express} from "express";

declare module fngServer {
    export interface ISearchResult {
        id: any,
        text: string,
        url?: string,
        additional?: string,
        resource?: string,
        resourceText: string,
        resourceTab?: string,
        weighting: number,
    }

    interface IInternalSearchResult extends ISearchResult {
        // for use in internal find - handles search result ordering etc.
        searchImportance? : number;
        addHits?: number;
        matched: number[];
        // the next two are only set where the resource options includes disambiguation instructions and multiple search results with the same text value are found...:
        disambiguationId?: any; // this will identify the record (from another resource) that will be used to disambiguate them
        disambiguationResource?: string ;// ...and this will identify that resource
    }

    export interface IIdIsList {
        params: string;
    }

    export interface Path {
    }

    export interface Paths {
        [pathName: string]: Path;
    }

    export type ISearchResultFormatter = () => Promise<ISearchResult>;

    export type Dependency = {
        resource: Resource;
        keys: string[];
    }

    export type DependencyList = Dependency[];

    export interface ResourceOptions {
        suppressDeprecatedMessage?: boolean;
        onRemove?: (doc, req, cb) => void;
        handleRemove?: 'allow' | 'cascade';  // default behaviour is to prevent deletion if record is used as a foreign key
        searchImportance?: boolean | number,
        onSave?: (doc, req, cb) => void,
        findFunc?: (req, cb) => void,
        getOrgCriteria?: (userOrganisation: string) => Promise<any>
        idIsList?: IIdIsList,
        searchResultFormat?: ISearchResultFormatter,
        searchOrder?: any,
        listOrder?: any,
        onAccess?: (req, cb) => void,
        searchFunc?: SearchFunc;
        synonyms? : {name: string, filter?: any}[],     // name must be lower case
        // when performing a search, two results from this resource with the same value for .text will be disambiguated by
        // appending the description of the record from disambiguation.resource whose id matches result[disambiguation.field]
        disambiguation?: {
            field: string;
            resource: string;
        }
        // below here are autogenerated
        listFields?: ListField[];   // added after preprocess
        dependents?: DependencyList;   // can be added by generateDependencyList
        hide? : string[];
        paths?: Paths;
    }

    type SearchFunc = (resource: Resource,
                       req: Express.Request,
                       aggregationParam: any,
                       findParam: any,
                       sortOrder: any,
                       limit: number | null,
                       skip: number | null,
                       callback: (err: Error, docs?: any[]) => void
    ) => void;

    interface ResourceExport {
        model?: Model<any>;            // TODO TS Get rid of the ? here
        options?: ResourceOptions;
    }

    interface Resource extends ResourceExport {
        resourceName: string;
    }

    interface ListParams {
        ref: Boolean;                           // The object is this a lookup?
    }

    interface ListField {
        field: string;
        params?: ListParams;
    }

    interface IFngPlugin {
        plugin: (fng: any, expressApp: any, options: FngOptions) => Partial<IFngPlugin>;
        options: any;
        dependencyChecks? : {[resourceName: string] : DependencyList; };
    }

    interface IPluginMap {
        [key: string]: IFngPlugin;
    }

    interface FngOptions {
        urlPrefix?: string,
        plugins?: IPluginMap,
        modelFilter? : (p1: any, req: Request, resources: Resource[]) => Resource[]
    }

    type AmbiguousRecordStore<t> = { [resource: string]: t[] };

    interface DisambiguatableLookupItem {
        id: string;
        text: string;
        disambiguationId?: string;
    }
}