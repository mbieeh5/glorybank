export function DateCorector(tanggal: string): string {
    
    const tanggalIsString = tanggal.includes("/");

    if(tanggalIsString) {
        return tanggal;
    }

    const tanggalValid = tanggalIsString ? tanggal : new Date(tanggal);

    const tanggalIsDate = tanggalValid instanceof Date && !isNaN(tanggalValid.getTime());

    if(!tanggalIsDate) {
        return tanggal;
    }

    const tanggalValidation = `${tanggalValid.getDate().toString().padStart(2, '0')}/${
        (tanggalValid.getMonth() + 1).toString().padStart(2, '0')
    }/${tanggalValid.getFullYear()}@${tanggalValid.getHours().toString().padStart(2,'0')}:${
        tanggalValid.getMinutes().toString().padStart(2,'0')
    }:${tanggalValid.getSeconds().toString().padStart(2, '0')}`

    return tanggalValidation;
}