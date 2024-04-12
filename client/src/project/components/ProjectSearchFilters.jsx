import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import TextInput from '../../shared/components/form-elements/TextInput';
import SelectInput from '../../shared/components/form-elements/SelectInput';
import CheckBox from '../../shared/components/form-elements/Checkbox';

export default function ProjectSearchFilters({ onSubmit }) {
    const { register, handleSubmit, watch } = useForm();

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            console.log(value)
            onSubmit(value)
        }
        )
        return () => subscription.unsubscribe()
    }, [watch])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                {/* <div className=' col-md-4 col-2 ps-2'>
                    <button className='btn btn-warning'>Search</button>
                </div> */}
            </div>

            <div className='row mt-3'>
                {/* <div className='col-md-3 col-6 d-flex align-item-center'>
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
                                    value: 'time-desc',
                                    text: 'Oldest'
                                },
                            ]}
                        />
                    </div>



                </div>
                <div className='col-md-3 col-6 d-flex align-item-center'>
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



                </div> */}
            </div>

        </form>
    )
}
