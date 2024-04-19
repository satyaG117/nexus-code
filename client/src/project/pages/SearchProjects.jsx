import { useForm } from 'react-hook-form'
import TextInput from '../../shared/components/form-elements/TextInput';
import SelectInput from '../../shared/components/form-elements/SelectInput';
import CheckBox from '../../shared/components/form-elements/Checkbox';

import ProjectList from '../components/ProjectList';
import { useContext, useState } from "react";
import { AuthContext } from "../../shared/contexts/AuthContext";
import useFetch from "../../shared/hooks/useFetch";
import Spinner from "../../shared/components/loading-icons/Spinner";
import React, { useEffect } from 'react'


export default function SearchProjects() {

  const { register, getValues, watch } = useForm();

  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [page, setPage] = useState(1);
  const auth = useContext(AuthContext);
  const makeRequest = useFetch();

  const toggleLikeState = (projectId) => {
    setProjects((prevState) => {
      return prevState.map((p) => {
        if (p._id == projectId) {
          if (p.isLiked) {
            return { ...p, isLiked: false, likesCount: p.likesCount - 1 }
          } else {
            return { ...p, isLiked: true, likesCount: p.likesCount + 1 }
          }
        }

        return p
      });
    });
  }

  const toggleLike = async (projectId) => {
    console.log(projectId);
    try {
      // optimistic update
      toggleLikeState(projectId);
      await makeRequest(`http://localhost:5000/api/projects/${projectId}/like`, 'POST', null, {
        'Authorization': auth.token
      });
    } catch (err) {
      toast.error(err.message)
      toggleLikeState(projectId);
    }
  }

  const getSearchParams = ()=>{
    let searchParams = {}
    searchParams.searchTerm = getValues('searchTerm')
    searchParams.sortBy = getValues('sortBy')
    searchParams.includeForks = getValues('includeForks')

    return searchParams;
  }

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      setPage(1)
      setProjects([]);
      let searchParams = getSearchParams();
      handleSearch(searchParams)
    }
    )
    return () => subscription.unsubscribe()
  }, [watch])

  const handleSearch = async (searchParams) => {
    console.log(searchParams)
    try {
      setIsLoading(true);
      setError(null);
      const responseData = await makeRequest(`http://localhost:5000/api/projects/search?searchTerm=${searchParams.searchTerm}&sortBy=${searchParams.sortBy}&includeForks=${searchParams.includeForks}&page=${page}&limit=${6}`, 'GET', null, {
        'Authorization': auth.token
      });
      setProjects(prevState => [...prevState, ...responseData]);
      setPage(prev => prev + 1);
    } catch (err) {
      console.log(err);
      setError(err.message)
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="mt-4 mx-3">
        <form>
          <div className='row'>
            <div className='col-md-6 col-12'>
              <TextInput
                placeholder={'Search for projects...'}
                type={'text'}
                register={register}
                name={'searchTerm'}
              />
            </div>
            <div className='col-md-3 col-6 d-flex align-item-center m-md-0 mt-3'>
              <div className='m-auto'>
                Sort by :
                &nbsp;
              </div>
              <div style={{ flex: 1 }}>
                <SelectInput
                  register={register}
                  name={'sortBy'}
                  options={[
                    {
                      value: 'likes-desc',
                      text: 'Likes (High to Low)'
                    },
                    {
                      value: 'likes-asc',
                      text: 'Likes (Low to high)'
                    },
                    {
                      value: 'time-desc',
                      text: 'Newest'
                    },
                    {
                      value: 'time-asc',
                      text: 'Oldest'
                    },
                  ]}
                />
              </div>



            </div>
            <div className='col-md-3 col-6 d-flex align-item-center m-md-0 mt-3'>
              <div className='m-auto'>
                Include forks :
                &nbsp;
              </div>
              <div style={{ flex: 1 }} className='m-auto'>
                <CheckBox
                  register={register}
                  name={'includeForks'}
                />
              </div>

            </div>
          </div>

        </form>
      </div>
      <div className="mt-3">
        {projects && <ProjectList projects={projects} toggleLike={toggleLike} />}
        {isLoading && <div className="m-auto"><Spinner /></div>}
        {error && <div className="text-center mt-4">{error}</div>}
        <div className='text-center my-4'>
          {page > 1 && <button className='btn btn-light' onClick={()=>{handleSearch(getSearchParams())}}>Load more</button>}
        </div>
      </div>
    </>
  )
}
