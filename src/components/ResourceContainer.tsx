import * as React from 'react';
import degreeData from './DegreeData';

type ResourceProps = {
    title: string;
    link: string;
    description: string;
}

type ResourceContainerProps = {
    majors: Array<string>,
    minors: Array<string>
}

type DegreeWithResources = {
    degree: string,
    resources: Array<ResourceProps>
}

export default class ResourceContainer extends React.Component<ResourceContainerProps> {

    state = {
        showResources: false
    }

    getResourcesWrapper = (): JSX.Element => {
        if (this.state.showResources) {
            return (
                <div className="resources-wrapper">
                    <div className="resources-header">
                        Resources
                    </div>
                    <div id="resources-container" className="resources-container">
                        {degreeData.getResources(this.props.majors, this.props.minors).map(degreeWithResources => {
                            return (
                            <div className="resources-degree-container" key={degreeWithResources.degree}>
                                <div className="resources-degree-title">{degreeWithResources.degree + " Resources"}</div>
                                {degreeWithResources.resources.map((resource) => {
                                    return (
                                        <div className="resource-info" key={degreeWithResources.degree + " " + resource.description}>
                                            <div className="resource-titie">
                                                <a href={resource.link} target="_blank">{resource.title}</a>
                                            </div>
                                            <div className="resource-description">{resource.description}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )})}
                    </div>
                </div>
            )
        }
        return null;
    }

    toggleResources = () => {
        this.setState({
            showResources: !this.state.showResources
        })
    }

    render() {
        return (
            <div className="resource-container-wrapper">
                <div className="show-resources">
                    <input type="checkbox" 
                        className="resources-checkbox" 
                        id="resources-checkbox" 
                        checked={this.state.showResources} onChange={this.toggleResources}
                    />
                    Show Resources
                </div>
                {this.getResourcesWrapper()}
            </div>
        );
    }
}

export { ResourceProps, DegreeWithResources };