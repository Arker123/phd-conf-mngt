import React, { useState, useEffect } from 'react'
import { getUserToken, setAppToken } from '../../components_login/Tokens';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoaderCard from '../../components/loading/LoaderCard';
import { delay } from '../../components/loading/Delay';
import { BASE_URL } from '../../components/requests/URL';
import { FaSort } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';

const data = [];
// let initializedMaps = false;

function ApplicationsHome() {
    const [isLoading, setIsLoading] = useState(true);
    const [initializedMaps,setInitializedMaps] = useState(false);
    const navigate = useNavigate();
    const [apps, setApps] = useState(data);

    const [apps2, setApps2] = useState(data);
    const [st, setSt] = useState(1);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // const filteredData = Object.keys(data1).reduce((acc, key) => {
    //   if (data1[key].name.toLowerCase().includes(searchQuery.toLowerCase())) {
    //     acc[key] = data1[key];
    //   }
    //   return acc;
    // }, {});

    function handleSearchInputChange(event) {
        setSearchQuery(event.target.value);
    }

    const tabs = [
        { label: 'Time', content: 'Applications are being displayed based on Time of the conference.' },
        { label: 'Name', content: 'Applications are being displayed based on Name of the conference.' },
        { label: 'Place', content: 'Applications are being displayed based on Place of the conference.' },
    ];
    function handleTabClick(index) {
        setActiveTabIndex(index);
        if (index === 0) {
            apps.sort((a, b) => a.conferenceStarts.localeCompare(b.conferenceStarts));
        }
        else if (index === 1) {
            apps.sort((a, b) => a.nameOfConference.localeCompare(b.nameOfConference));
        }
        else if (index === 2) {
            apps.sort((a, b) => a.venueOfConference.localeCompare(b.venueOfConference));
        }
    }
    // unsorted
    const handleChange = () => {
        console.log("clicked")
        if (st === 1) {
            // sorted
            setSt(2);
        }
        else {
            setSt(1);
        }
        console.log(apps);
        apps.sort((a, b) => a.nameOfConference.localeCompare(b.nameOfConference));
        console.log(apps);
    }

    const getBasicInfo = async (req, res) => {
        try {
            const token = getUserToken();
            const resp = await fetch(`${BASE_URL}/studentApplicationView`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
            });
            const data = await resp.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getBasicInfo().then((resp) => {
            setApps(resp);
            setApps2(resp.slice(0,1))            // delay of 2 seconds
            delay(100).then(() => {
                setIsLoading(false);
            }).catch((error) => {
                console.log(error);
            })


        }).catch((e) => {
            console.log(e.message)
        });
    }, []);

    const getStatus = (code) => {
        if (code === "0")
            return "Pending Faculty Approval";
        else if (code === "1")
            return "Pending Hod Section Approval";
        else if (code === "2")
            return "Pending Research Section Approval";
        else if (code === "3")
            return "Pending Account Section Approval";
        else if (code === "4")
            return "Pending Dean Approval";
        else
            return "Application Approved";
    }

    const getDays = (subDate) => {
        const today = new Date();
        const submitDate = new Date(subDate);

        const days = Math.floor((today - submitDate) / (1000 * 3600 * 24));

        if (days < 1)
            return "Submitted Recently";
        else if (days === 1)
            return ("1 Day Ago");
        else
            return (days + " Days ago");

    }

    const getFinances = (finance) => {
        var totalAmount = 0;

        finance.forEach(element => {
            totalAmount = totalAmount + Number(element.amount);
        });
        return totalAmount;
    }

    // const newApps = async () => {
    //     apps2 = await apps.slice(0,1);
    //     console.log("done")
    // }

    const createAppToken = async (id) => {
        try {
            const aisehi = "abcd";
            const resp = await fetch(`${BASE_URL}/createApplicationToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id, aisehi })
            });
            const data = await resp.json();
            const appToken = data.appToken;
            setAppToken(appToken);

        } catch (error) {
            console.log(error);
        }
    }

    const viewSpecficApplication = async (e) => {
        e.preventDefault();
        const { name } = e.target;
        try {
            await createAppToken(name);
            navigate('/studentLogin/viewApplication');

        } catch (error) {
            console.log(error);
        }

    }

    const renderApps1 = apps.map((item, index) =>
        <>
            <div key={index}>
                <section className="bg-white dark:bg-gray-900">
                    <div className="">
                        <h2 className="mb-2 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white">{item.nameOfConference}</h2>
                        <p className="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white"></p>
                        <dl>
                            <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">{getStatus(item.status)}</dt>
                            <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">Venue: {item.venueOfConference}</dd>
                            <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">Amount Needed: {getFinances(item.finances)} Rs</dd>
                        </dl>
                        <dl className="flex items-center space-x-6">
                            <div>
                                <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Submission status</dt>
                                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{getDays(item.createdAt)}</dd>
                            </div>
                            <div>
                                <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Category</dt>
                                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">India</dd>
                            </div>
                        </dl>
                        <div className="pb-4 flex items-center space-x-4">
                            <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                Edit
                            </button>
                            <button type="button" name={item._id}
                                onClick={viewSpecficApplication} className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                                <FaPaperPlane style={{ marginRight: '0.5rem' }} />
                                View Full Application
                            </button>
                        </div>
                    </div>
                </section>

            </div>

            <br />
        </>
    );

    const renderApps2 = apps2.map((item, index) =>
        <>
            {/* {newApps()} */}
            <div key={index}>

                <div className="block max-w-md  rounded-lg  bg-white text-center shadow-lg dark:bg-neutral-700">
                    <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-gray-600 dark:text-neutral-50">
                        {getStatus(item.status)}
                    </div>
                    <div className="p-4">
                        <h5
                            className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                            {item.nameOfConference}
                        </h5>
                        <p className="mb-1 text-base text-neutral-600 dark:text-neutral-200">
                            Amount Needed: {getFinances(item.finances)} Rs
                        </p>
                        <p className="mb-1 text-base text-neutral-600 dark:text-neutral-200">
                            Venue: {item.venueOfConference}
                        </p>
                    </div>
                    <button
                        name={item._id}
                        onClick={viewSpecficApplication}
                        className="rounded-md bg-indigo-600 px-3 py-2 mb-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Vew Full Application
                    </button>
                    <div
                        className="border-t-2 border-neutral-100 px-6 py-3 dark:border-neutral-600 dark:text-neutral-50">
                        {getDays(item.createdAt)}
                    </div>
                </div>

            </div>

            <br />
        </>
    );

    return (

        <>
            <br />
            {isLoading ?
                <Container>
                    <LoaderCard />
                </Container>
                :
                <Container>
                        {/* {newApps} */}
                        {console.log(apps)}
                        {console.log(apps2)}
                    <div className="my-3 flex flex-wrap justify-center gap-4">
                        {(apps2.map((item, index) =>
                            <>
                                <div key={index}>
                                    <section className="bg-white dark:bg-gray-900">
                                        <div className="">
                                            <h2 className="mb-2 text-xl font-semibold leading-none text-gray-900 md:text-2xl dark:text-white">{item.nameOfConference}</h2>
                                            <p className="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white"></p>
                                            <dl>
                                                <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">{getStatus(item.status)}</dt>
                                                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">Venue: {item.venueOfConference}</dd>
                                                <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">Amount Needed: {getFinances(item.finances)} Rs</dd>
                                            </dl>
                                            <dl className="flex items-center space-x-6">
                                                <div>
                                                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Submission status</dt>
                                                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">{getDays(item.createdAt)}</dd>
                                                </div>
                                                <div>
                                                    <dt className="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Category</dt>
                                                    <dd className="mb-4 font-light text-gray-500 sm:mb-5 dark:text-gray-400">India</dd>
                                                </div>
                                            </dl>
                                            <div className="pb-4 flex items-center space-x-4">
                                                <button type="button" className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                    <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                    Edit
                                                </button>
                                                <button type="button" name={item._id}
                                                    onClick={viewSpecficApplication} className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                                                    <FaPaperPlane style={{ marginRight: '0.5rem' }} />
                                                    View Full Application
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                </div>

                                <br />

                            </>
                        ))}

                    </div>
                </Container>
            }


        </>
    )
}

export default ApplicationsHome