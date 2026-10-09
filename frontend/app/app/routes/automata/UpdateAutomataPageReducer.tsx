export interface CellularAutomatonData {
  name: string;
  slug: string;
  description: string;
  sourceCode: string;
}
export class CurrentAutomataState
{
    chosenTagsIds:string[]=[];
    cellularAutomatonData:CellularAutomatonData|null=null;
    
    //Когда необходимые данные автомата заполнены достаточно
    isReady:boolean=false;
    isDownloaded:boolean=false;
}
export const automataInitialState ={chosenTagsIds:[], cellularAutomatonData:null, isReady:false, isDownloaded:false};
export const automataActions =
{
    //теги загружены из интернета (все возможные теги, а значит на состояние особо не влияет)
    chosen_tags_set(tags_ids:string[])
    {
        return {
            type:'chosen_tags_set',
            tags_ids:tags_ids
        }
    },
    automata_data_downloaded(automata_data:CellularAutomatonData)
    {
        return {
            type:'automata_data_downloaded',
            automata_data:automata_data
        }
    },
    automata_data_updated(automata_data:CellularAutomatonData)
    {
        return {
            type:'automata_data_updated',
            automata_data:automata_data
        }
    }

}
export function automataReducer(state:CurrentAutomataState, action:any):CurrentAutomataState {
    console.log('dispatched', action)
  switch (action.type) {
    //загружены теги
    case 'chosen_tags_set': {
        return {
            ...state,
            chosenTagsIds:action.tags_ids
        }
      
    }
    case 'automata_data_downloaded': {
        return {
            ...state,
            cellularAutomatonData:action.automata_data,
            isReady:true,
            isDownloaded:true
        }
      
    }
    case 'automata_data_updated': {
        let aut_data = action.automata_data as CellularAutomatonData
        let isValid = false;
        if(aut_data.name.length>0 && aut_data.sourceCode.length>0 )
        {
            isValid=true;
        }
      return {
            ...state,
            cellularAutomatonData:action.automata_data,
            isReady:isValid
        }
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
