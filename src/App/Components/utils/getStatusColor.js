function getStatusColor(status) {
    switch (status) {
        case 'Черновик':
            return '#8C8C8C'
        case 'На согласовании':
            return '#FAAD14'
        case 'В процессе':
            return '#1890FF'
        case 'Завершено':
            return '#7CB305'
        case 'Отменено':
            return '#ED1C24'
    }
    return '#8C8C8C'
}

export default getStatusColor
