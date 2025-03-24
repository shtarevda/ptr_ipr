import getParamModalWindow from './getParamModalWindow'

export default (multiSelect, collaborators = [], setCollaborators, save) => {
    const setRecords = () => {
        return collaborators
    }
    // выбор сотрудников
    const set = () => {
        const param = getParamModalWindow(multiSelect, setRecords)
        param.callback = (arrId) => {
            if (save) save(arrId)
            if (setCollaborators) setCollaborators(arrId)
        }
        const mw = new document.petrovich.ModalWindowSelect(param)
        mw.show()
    }

    return [set]
}
