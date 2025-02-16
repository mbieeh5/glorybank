const filterParams = {comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    const dateAsString = cellValue.split('@')[0];
    if(dateAsString == null) return -1;
    const dateParts = dateAsString.split("/");
    const cellDate = new Date(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
    )
    if(filterLocalDateAtMidnight.getTime() === cellDate.getTime()){
        return 0
    }
    if(cellDate < filterLocalDateAtMidnight){
        return -1;
    }
    if(cellDate > filterLocalDateAtMidnight) {
        return 1;
    }
    return 0
},
minValidYear: 2000,
maxValidYear: 2028,
inRangeFloatingFilterDateFormat: "Do MMM YYYY"
};


export default filterParams;