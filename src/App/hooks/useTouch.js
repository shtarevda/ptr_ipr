import React, {useState, useEffect} from "react"

function useInformation(defaultShift, width){
    const [startX, setStartX] = useState(null)
    const [startY, setStartY] = useState(null)
    const [move, setMove] = useState(null)

    const [shift, setShift] = useState(defaultShift)
    const [maxShift, setMaxShift] = useState(null)
    const [saveShift, setSaveShift] = useState(shift)

    const [action, setAction] = useState(null)

    const [isAnimation, setIsAnimation] = useState(true)


    /**
     * Получить максимально возможный сдвиг
     * @param {object} elem - дом элемент контейнера со слайдером
     * @param {number} widthElemSlider - ширина всех элементов слайдера
     */
    const saveMaxShift = (elem, widthElemSlider) => {
        const widthContainetSlider = elem.getBoundingClientRect().width

        const maxShift = widthElemSlider - widthContainetSlider
        setMaxShift(maxShift * -1)
    }


    /**
     * Установить смещение для слайдера
     * @param {string} action - тип действия
     * @param {object} sliderContent - дом элемент контейнера со слайдером
     * @param {object} e - событие
     */
    const moves = (action, sliderContent, e) => {
        saveMaxShift(sliderContent, width)

        // палец убрали от экрана
        if (action === 'end') {
            setIsAnimation(true)
            setSaveShift(shift)
            return
        }

        const x = e.targetTouches[0].clientX
        const y = event.touches[0].clientY;

        // палец коснулся экрана
        if (action === 'start') {
            setStartX(x)
            setStartY(y)
            return
        }

        const dx = Math.abs(x - startX);
        const dy = Math.abs(y - startY) * 2;

        //запретить движение по оси X
        if (dx < dy) {
            return
        }

        setIsAnimation(false)
        setMove(x) // свайп по экрану
    }


    useEffect(() => {
        if (isAnimation && shift && shift !== saveShift) {
            setSaveShift(shift)
        }
    }, [shift])


    useEffect(() => {
        const result = move - startX
        const shift = saveShift + result

        if (shift > 0) {
            setShift(18)
            return
        }

        if (shift < maxShift) {
            setShift(maxShift)
            return
        }

        setShift(shift)
    }, [move])


    return [{shift, isAnimation}, moves]
}

export default useInformation
