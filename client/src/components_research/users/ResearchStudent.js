import React, { useState, useEffect } from 'react'
import LoaderContent from '../../components/loading/LoaderContent';
import StudentUser from './StudentUser';
import * as XLSX from 'xlsx';
import { delay } from '../../components/loading/Delay';
import { BASE_URL } from '../../components/requests/URL';

export default function ResearchStudent() {

    const [student, setStudent] = useState();
    const [isLoadingHome, setIsLoadingHome] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const [fileName, setFileName] = useState("Student Data Excel File");
    const [uploadStudent, setUploadStudent] = useState([]);


    const getUserInfo = async (req, res) => {
        try {
            const resp = await fetch(`${BASE_URL}/viewUsers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return resp.json();
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getUserInfo().then((resp) => {
            setStudent(resp.studentUser);

            // delay of 2 seconds
            delay(100).then(() => {
                setIsLoadingHome(false);
            }).catch((error) => {
                console.log(error);
            })

        }).catch((error) => {
            console.log(error);
        })
    }, [refresh]);

    async function handleFile(e) {
        setFileName(e.target.files[0].name);
        const files = e.target.files[0];
        const data = await files.arrayBuffer();

        const workBook = XLSX.read(data);
        const workSheet = workBook.Sheets[workBook.SheetNames[0]];
        const studentData = XLSX.utils.sheet_to_json(workSheet);

        setUploadStudent(studentData);

    };

    async function uploadFile(e) {
        e.preventDefault();
        setFileName("Uploading Student Data. Please Wait");
        var data;
        try {
            const resp = await fetch(`${BASE_URL}/addStudent`, {
                method: "POSt",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(uploadStudent)
            });
            data = await resp.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(data.update);
        XLSX.utils.book_append_sheet(wb, ws, "updates");
        XLSX.writeFile(wb, "studentUploadUpdates.xlsx");

        // logic for auto refreshing the page
        setFileName("Data Uploaded..");
        // delay of 3 seconds to refresh..
        await delay(3000);
        setRefresh(!refresh);
        setIsLoadingHome(true);
        setFileName("Student Data Excel File");
    }

    return (
        <>

            {isLoadingHome
                ?
                <LoaderContent />
                :
                <>
                    <div className='mx-auto'>

                        <StudentUser users={student} />

                        <div className=" px-4 mx-auto max-w-screen-xl  lg:py-6 lg:px-3">
                            <div className="mx-auto max-w-screen-sm text-center ">
                                <h2 className="mb-1 text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white">Add Students</h2>
                            </div>

                            <div>
                                {/* <label htmlFor="file" className="block text-sm text-gray-500 dark:text-gray-300">File</label> */}

                                <label htmlFor="dropzone-file" className="flex flex-col items-center w-full max-w-lg p-5 mx-auto mt-2 text-center bg-white border-2 border-gray-300 border-dashed cursor-pointer dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-500 dark:text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                    </svg>
                                    <h2 className="mt-1 font-medium tracking-wide text-gray-700 dark:text-gray-200">{fileName}</h2>
                                    <p className="mt-2 text-xs tracking-wide text-gray-500 dark:text-gray-400">Upload or drag & drop your Excel File</p>
                                    <input id="dropzone-file" className="hidden" onChange={(e) => handleFile(e)} type="file" />
                                </label>
                            </div>
                            <div className="mx-auto mt-3 max-w-screen-sm text-center ">
                                <button
                                    onClick={uploadFile}
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    Upload Student Data
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}
